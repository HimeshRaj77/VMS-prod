import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_extraction():
    file_path = "/Volumes/MacOS/Internship/input/WhatsApp Image 2026-05-23 at 5.49.34 PM.jpeg"
    
    print(f"Testing extraction with file: {file_path}")
    try:
        with open(file_path, "rb") as f:
            response = client.post(
                "/api/aadhaar/extract",
                files={"file": (file_path.split('/')[-1], f, "image/jpeg")}
            )
            
        print("Status Code:", response.status_code)
        if response.status_code == 200:
            import json
            print("Response JSON:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Response text:", response.text)
            
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    test_extraction()
