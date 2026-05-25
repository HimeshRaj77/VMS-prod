from pydantic import BaseModel

class ExtractRequest(BaseModel):
    file_path: str

class ExtractResponse(BaseModel):
    success: bool
    text: str
    error: str | None = None
