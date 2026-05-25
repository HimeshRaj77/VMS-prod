from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from app.schemas.extract import ExtractRequest, ExtractResponse
from app.services.pdf_extractor import extract_text_from_pdf
from app.ai.quotation_extractor import extract_structured_quotation
from app.ai.token_tracker import TokenTracker
from typing import Optional

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter()
token_tracker = TokenTracker()

class StructuredRequest(BaseModel):
    raw_data: dict

class BudgetCheckRequest(BaseModel):
    budget_usd: float
    month: Optional[str] = None

@router.post("/extract-text", response_model=ExtractResponse)
async def extract_text_endpoint(request: ExtractRequest):
    """
    Receives a local absolute file path and returns the extracted text from the PDF.
    """
    try:
        text = await extract_text_from_pdf(request.file_path)
        return ExtractResponse(success=True, text=text)
    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

@router.post("/extract-structured-quotation")
async def extract_structured_quotation_endpoint(request: StructuredRequest):
    """
    Receives raw extracted PDF JSON text, applies cleanups, invokes OpenAI GPT-4o-mini
    via Instructor, post-processes currencies/manpower, and returns verified structured JSON.
    """
    try:
        logger.info("Starting structured quotation extraction...")
        result = await extract_structured_quotation(request.raw_data)
        logger.info("Structured extraction completed successfully")
        return result
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        logger.error(f"Structured extraction error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Structured extraction failed: {str(e)}")


@router.get("/token-usage/summary")
async def get_token_usage_summary():
    """Get overall OpenAI token usage summary."""
    try:
        summary = token_tracker.get_usage_summary()
        return {"success": True, "data": summary}
    except Exception as e:
        logger.error(f"Error retrieving token summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving token summary: {str(e)}")


@router.get("/token-usage/daily")
async def get_daily_token_usage(date: Optional[str] = None):
    """Get token usage for a specific day (YYYY-MM-DD, defaults to today)."""
    try:
        daily_usage = token_tracker.get_daily_usage(date)
        return {"success": True, "data": daily_usage}
    except Exception as e:
        logger.error(f"Error retrieving daily token usage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving daily token usage: {str(e)}")


@router.get("/token-usage/monthly")
async def get_monthly_token_usage(month: Optional[str] = None):
    """Get token usage for a specific month (YYYY-MM, defaults to current month)."""
    try:
        monthly_usage = token_tracker.get_monthly_usage(month)
        return {"success": True, "data": monthly_usage}
    except Exception as e:
        logger.error(f"Error retrieving monthly token usage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving monthly token usage: {str(e)}")


@router.post("/token-usage/check-budget")
async def check_budget_remaining(request: BudgetCheckRequest):
    """Check remaining budget for the month."""
    try:
        if request.budget_usd <= 0:
            raise ValueError("Budget must be greater than 0")
        
        budget_status = token_tracker.check_budget_remaining(request.budget_usd, request.month)
        return {"success": True, "data": budget_status}
    except Exception as e:
        logger.error(f"Error checking budget: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking budget: {str(e)}")
