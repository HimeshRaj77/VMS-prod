import fitz
import os
import json

async def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a given PDF file using PyMuPDF (fitz) and returns it in structured JSON format.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at path: {file_path}")

    try:
        # Open the PDF using PyMuPDF
        doc = fitz.open(file_path)
        
        extracted_data = {
            "metadata": {
                "page_count": len(doc),
                "source_file": os.path.basename(file_path)
            },
            "pages": []
        }

        for i, page in enumerate(doc):
            # Extract text
            text = page.get_text()
            extracted_data["pages"].append({
                "page_number": i + 1,
                "content": text.strip() if text and text.strip() else None
            })
        
        doc.close()
        
        # Return as a formatted JSON string
        return json.dumps(extracted_data, indent=2)
    except Exception as e:
        raise Exception(f"Failed to extract text using PyMuPDF: {str(e)}")
