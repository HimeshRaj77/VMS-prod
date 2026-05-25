import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def normalize_column_name(col):
    return str(col).lower().replace("_", "").replace(" ", "").replace("-", "").strip()

@router.post("/excel/extract")
async def extract_excel(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .xlsx, .xls, or .csv")
        
        # Strip string values and clean DataFrame
        df = df.applymap(lambda s: s.strip() if isinstance(s, str) else s)
        
        # Flexible column mapping
        name_cols = ['name', 'fullname', 'workername', 'employeename', 'nameofworker']
        aadhar_cols = ['aadhar', 'aadhaar', 'aadhar_number', 'aadhaar_number', 'aadharnumber', 'aadhaarnumber', 'uid', 'uidai']
        dob_cols = ['dob', 'dateofbirth', 'birthdate']
        gender_cols = ['gender', 'sex', 'mf']
        
        col_mapping = {}
        for col in df.columns:
            norm = normalize_column_name(col)
            if norm in name_cols:
                col_mapping['name'] = col
            elif norm in aadhar_cols:
                col_mapping['aadhar'] = col
            elif norm in dob_cols:
                col_mapping['dob'] = col
            elif norm in gender_cols:
                col_mapping['gender'] = col
                
        # Ensure name and aadhar columns are matched
        if 'name' not in col_mapping or 'aadhar' not in col_mapping:
            raise ValueError("Required columns 'Name' and 'Aadhaar Number' not found in the spreadsheet. Please verify headers.")
            
        workers = []
        for index, row in df.iterrows():
            name_val = row[col_mapping['name']]
            aadhar_val = row[col_mapping['aadhar']]
            
            # Format/clean Aadhaar (e.g. convert to 12 digit string)
            if pd.isna(name_val) or pd.isna(aadhar_val):
                continue  # skip empty rows
                
            aadhar_str = str(aadhar_val).replace(".0", "").replace(" ", "").strip()
            
            # Normalize Aadhaar number format: 1234 5678 9012
            if len(aadhar_str) == 12:
                aadhar_formatted = f"{aadhar_str[:4]} {aadhar_str[4:8]} {aadhar_str[8:]}"
            else:
                aadhar_formatted = aadhar_str
                
            dob_val = row[col_mapping.get('dob')] if 'dob' in col_mapping else None
            if pd.isna(dob_val):
                dob_val = "01/01/1990"  # default fallback
            else:
                # format DOB to simple DD/MM/YYYY if it's a timestamp or datetime
                if hasattr(dob_val, 'strftime'):
                    dob_val = dob_val.strftime('%d/%m/%Y')
                else:
                    dob_val = str(dob_val).strip()
                    
            gender_val = row[col_mapping.get('gender')] if 'gender' in col_mapping else "MALE"
            if pd.isna(gender_val):
                gender_val = "MALE"
            else:
                gender_val = str(gender_val).strip().upper()
                if gender_val in ["M", "MALE"]:
                    gender_val = "MALE"
                elif gender_val in ["F", "FEMALE"]:
                    gender_val = "FEMALE"
            
            workers.append({
                "name": str(name_val).strip(),
                "aadharNumber": aadhar_formatted,
                "dob": dob_val,
                "gender": gender_val
            })
            
        return {
            "success": True,
            "data": workers,
            "count": len(workers)
        }
        
    except ValueError as ve:
        logger.error(f"Excel parsing validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Excel parsing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse Excel sheet: {str(e)}")
