import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_quotation_pipeline():
    file_path = "/Volumes/MacOS/VMS/Quotations/Ashara_1448H_Quotation_System_Design.pdf"
    
    print(f"--- Testing Quotation Pipeline ---")
    print(f"1. Extracting text from: {file_path}")
    
    # Step 1: Extract Text
    text_response = client.post(
        "/extract-text",
        json={"file_path": file_path}
    )
    
    print("Extract Text Status Code:", text_response.status_code)
    if text_response.status_code != 200:
        print("Error extracting text:", text_response.text)
        return
        
    text_data = text_response.json()
    extracted_text = text_data.get("text", "")
    print(f"Extracted {len(extracted_text)} characters of text.")
    
    # Step 2: Structured Extraction via LLM
    print("\n2. Passing extracted text to LLM engine for structured quotation extraction...")
    
    # Wrap text in pages format expected by extract_structured_quotation
    raw_data = {
        "metadata": {"source_file": "Ashara_1448H_Quotation_System_Design.pdf"},
        "pages": [
            {"page_number": 1, "content": extracted_text}
        ]
    }
    
    structured_response = client.post(
        "/extract-structured-quotation",
        json={"raw_data": raw_data}
    )
    
    print("Structured Extraction Status Code:", structured_response.status_code)
    if structured_response.status_code == 200:
        import json
        print("\nStructured Response JSON:")
        print(json.dumps(structured_response.json(), indent=2))
    else:
        print("Error in structured extraction:", structured_response.text)

if __name__ == "__main__":
    test_quotation_pipeline()
