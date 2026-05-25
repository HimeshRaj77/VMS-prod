import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import extract
from app.routes.aadhaar import router as aadhaar_router
from app.routes.excel import router as excel_router

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="PDF Extraction Service", version="1.0.0")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract.router)
app.include_router(aadhaar_router, prefix="/api")
app.include_router(excel_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "PDF Extraction Service is running"}
