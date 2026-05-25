from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.extend_parse_service import ExtendParseService
from app.services.aadhaar_extraction_service import AadhaarExtractionService

router = APIRouter()


@router.post("/aadhaar/extract")
async def extract_aadhaar(file: UploadFile = File(...)):
    try:
        parsed_text = await ExtendParseService.parse_document(file)

        extracted_data = await AadhaarExtractionService.extract(parsed_text)

        return {
            "success": True,
            "data": extracted_data,
            "raw_text": parsed_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
