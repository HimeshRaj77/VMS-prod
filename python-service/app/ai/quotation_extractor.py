import re
import time
import logging
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from rapidfuzz import process, fuzz
from openai import RateLimitError, APIError

from app.ai.schemas import StructuredQuotationResponse, DepartmentEnum
from app.ai.openai_client import get_instructor_client
from app.ai.prompts import SYSTEM_PROMPT
from app.ai.validators import validate_quotation
from app.ai.normalization import normalize_currency, parse_manpower_pattern
from app.ai.token_tracker import TokenTracker

logger = logging.getLogger("quotation_extractor")
logging.basicConfig(level=logging.INFO)

# Initialize token tracker
token_tracker = TokenTracker()

def clean_extracted_text(text: str) -> str:
    """
    Cleans raw PDF text: removes noisy bullet symbols, normalizes multiple
    newlines/spaces, and maintains a clean stream.
    """
    if not text:
        return ""
    
    # Remove odd control characters and noisy bullet marks
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
    text = re.sub(r'[•▪♦★•●■+-]\s*', ' ', text)
    
    # Normalize double linebreaks and spacing
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    
    return text.strip()

@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type((RateLimitError, APIError))
)
async def _call_openai_with_retry(client, messages, source_file) -> StructuredQuotationResponse:
    structured_res = await client.chat.completions.create(
        model="gpt-4o-mini",
        response_model=StructuredQuotationResponse,
        messages=messages,
        temperature=0.1
    )
    
    # Log token usage
    if hasattr(structured_res, '_client_response'):
        usage = structured_res._client_response.usage
        token_tracker.log_request(
            model="gpt-4o-mini",
            input_tokens=usage.prompt_tokens,
            output_tokens=usage.completion_tokens,
            quotation_id=None,
            source_file=source_file
        )
    return structured_res

def _normalize_and_fuzzy_match(structured_res: StructuredQuotationResponse) -> StructuredQuotationResponse:
    # Normalize general quotation fields
    q = structured_res.quotation_meta
    q.grand_total_before_gst = normalize_currency(q.grand_total_before_gst)
    q.gst_amount = normalize_currency(q.gst_amount)
    q.final_total_after_gst = normalize_currency(q.final_total_after_gst)

    # Normalize service specific fields
    valid_departments = [e.value for e in DepartmentEnum if e.value != "UNCLASSIFIED"]

    for s in structured_res.line_items:
        s.rate_per_day = normalize_currency(s.rate_per_day)
        s.subtotal = normalize_currency(s.subtotal)
        
        # If duration or manpower counts are missing, try to parse from descriptive fields
        if not s.quantity or not s.duration_days:
            parsed_count, parsed_days = parse_manpower_pattern(s.quantity_description)
            if parsed_count and not s.quantity:
                logger.info(f"Parsed quantity {parsed_count} from description: {s.quantity_description}")
                s.quantity = parsed_count
            if parsed_days and not s.duration_days:
                logger.info(f"Parsed duration_days {parsed_days} from description: {s.quantity_description}")
                s.duration_days = parsed_days
                
        # Fuzzy fallback for UNCLASSIFIED
        if s.department_name == DepartmentEnum.UNCLASSIFIED and s.role_title:
            match = process.extractOne(s.role_title, valid_departments, scorer=fuzz.ratio)
            if match and match[1] > 85:
                logger.info(f"Fuzzy auto-corrected '{s.role_title}' from UNCLASSIFIED to '{match[0]}' (Score: {match[1]})")
                s.department_name = DepartmentEnum(match[0])
                
    return structured_res

async def extract_structured_quotation(raw_extracted_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Primary processing engine: merges pages, cleans text, calls GPT-4o-mini
    via Instructor, post-processes currencies, runs mathematical validation, and returns metadata.
    """
    start_time = time.time()
    
    # 1. Merge pages and apply cleaning
    pages = raw_extracted_json.get("pages", [])
    merged_text_parts = []
    
    for p in pages:
        p_num = p.get("page_number", 1)
        p_content = p.get("content", "")
        cleaned_content = clean_extracted_text(p_content)
        if cleaned_content:
            merged_text_parts.append(f"--- PAGE {p_num} ---\n{cleaned_content}")
            
    full_text = "\n\n".join(merged_text_parts)
    source_file = raw_extracted_json.get("metadata", {}).get("source_file", "unknown_source.pdf")
    
    if not full_text:
        raise ValueError("No readable text content found in the raw extracted JSON.")

    logger.info(f"Initiating structured extraction for: {source_file} ({len(full_text)} chars)")
    
    # 2. Get Instructor Client
    client = get_instructor_client()
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Here is the raw extracted text of the quotation '{source_file}':\n\n{full_text}"}
    ]
    
    # 3. Call OpenAI model - Pass 1
    openai_start = time.time()
    try:
        structured_res = await _call_openai_with_retry(client, messages, source_file)
    except Exception as e:
        logger.error(f"OpenAI GPT structured extraction failed: {str(e)}")
        raise e
        
    structured_res.quotation_meta.source_file_name = source_file
    structured_res = _normalize_and_fuzzy_match(structured_res)
    validated_response, errors = validate_quotation(structured_res)
    
    # 4. Self-Healing Loop - Pass 2
    if errors:
        logger.info(f"Math validation failed with {len(errors)} errors. Executing Pass 2 self-healing.")
        error_msg = "Validation failed for your previous extraction. Please review the document and correct these math errors:\n" + "\n".join(errors)
        
        messages.append({"role": "assistant", "content": structured_res.model_dump_json()})
        messages.append({"role": "user", "content": error_msg})
        
        try:
            structured_res_2 = await _call_openai_with_retry(client, messages, source_file)
            structured_res_2.quotation_meta.source_file_name = source_file
            structured_res_2 = _normalize_and_fuzzy_match(structured_res_2)
            validated_response, errors_2 = validate_quotation(structured_res_2)
            if errors_2:
                logger.warning("Pass 2 self-healing still failed validation. Flagging as Manual Review.")
        except Exception as e:
            logger.error(f"Pass 2 self-healing failed due to API error: {str(e)}. Falling back to Pass 1 results.")

    openai_latency = time.time() - openai_start
    logger.info(f"OpenAI operations completed in {openai_latency:.2f} seconds")

    total_latency = time.time() - start_time
    logger.info(f"Total structured extraction completed successfully in {total_latency:.2f}s")
    
    # 6. Build the final enterprise return JSON with performance metrics
    return {
        "success": True,
        "structured_data": validated_response.model_dump(),
        "performance": {
            "total_latency_seconds": round(total_latency, 3),
            "openai_latency_seconds": round(openai_latency, 3),
            "character_count": len(full_text)
        }
    }
