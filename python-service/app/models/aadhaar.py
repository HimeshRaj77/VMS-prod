from pydantic import BaseModel


class AadhaarData(BaseModel):
    full_name: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    aadhaar_number: str | None = None
