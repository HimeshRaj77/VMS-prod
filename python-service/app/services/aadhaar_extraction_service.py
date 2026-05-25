import logging
from app.models.aadhaar import AadhaarData
from app.ai.openai_client import get_instructor_client

logger = logging.getLogger(__name__)

class AadhaarExtractionService:
    @classmethod
    async def extract(cls, parsed_text: str) -> AadhaarData:
        """
        Extract structured data from Aadhaar document text using GPT-4o-mini via Instructor.
        """
        client = get_instructor_client()
        
        prompt = f"""You are an expert at extracting structured data from Indian identity documents.
        
Extract the following fields from the Aadhaar document text:
1. Full Name: The full name as it appears.
2. Date of Birth: Must be exactly DD/MM/YYYY format.
3. Aadhaar Number: The 12-digit number. Remove any spaces so it is a continuous string of 12 digits.
4. Gender: Must be exactly Male, Female, or Other.

IMPORTANT RULES:
- If a field is not clearly visible or present, return null.
- Ensure the Aadhaar number contains no spaces.

Document Text:
---
{parsed_text}
---
"""
        try:
            logger.info("Extracting Aadhaar data using gpt-4o-mini...")
            extracted_data = await client.chat.completions.create(
                model="gpt-4o-mini",
                response_model=AadhaarData,
                messages=[
                    {"role": "system", "content": "You are a precise data extraction AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            return extracted_data
            
        except Exception as e:
            logger.error(f"Failed to extract Aadhaar data via OpenAI: {e}")
            raise e
