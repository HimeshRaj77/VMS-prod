import re
from typing import Optional, Tuple

def normalize_currency(val) -> Optional[int]:
    """
    Cleans currency strings (e.g. '₹77,82,150.00', '₹ 1,350', '45,000 INR')
    and returns a clean, schema-safe integer.
    """
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return int(val)
        
    s = str(val).strip()
    if not s:
        return None

    # Handle decimals (e.g. '.00') safely
    if '.' in s:
        parts = s.split('.')
        # If the decimal part is purely fractional, we keep the main part
        s = parts[0]

    # Strip everything except digits
    cleaned = re.sub(r'[^\d]', '', s)
    if cleaned:
        try:
            return int(cleaned)
        except ValueError:
            return None
    return None

def parse_manpower_pattern(text: str) -> Tuple[Optional[int], Optional[int]]:
    """
    Attempts to parse expressions like '123 Staff x 14 Days' or '15 Guards x 3 Days'
    and returns a tuple of (manpower_count, duration_days).
    """
    if not text:
        return None, None
        
    # Match pattern: {count} {Type} x {days} Days
    pattern = r'(\d+)\s*[a-zA-Z\s]*\s*[xX*]\s*(\d+)\s*(?:Days|Day|days|day)?'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        try:
            count = int(match.group(1))
            days = int(match.group(2))
            return count, days
        except (ValueError, IndexError):
            pass
            
    return None, None
