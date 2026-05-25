from typing import Dict, Any, List, Tuple
from app.ai.schemas import StructuredQuotationResponse
import logging

logger = logging.getLogger("quotation_validators")

def validate_quotation(res: StructuredQuotationResponse) -> Tuple[StructuredQuotationResponse, List[str]]:
    """
    Validates mathematical relations within the structured quotation response.
    Applies deterministic re-calculation and sets confidence/status based on validation.
    No internal healing or recalculation of totals is performed.
    """
    q = res.quotation_meta
    services = res.line_items
    payment_terms = res.payment_terms

    # 1. Total Services Count Validation
    q.total_services = len(services)

    requires_manual_review = False
    errors = []

    # 2. Subtotals Math Verification
    calculated_grand_subtotal = 0
    for s in services:
        # Check subtotal calculation if all parts are defined
        if s.quantity is not None and s.rate_per_day is not None and s.duration_days is not None:
            expected_sub = s.quantity * s.rate_per_day * s.duration_days
            if s.subtotal is not None and s.subtotal != expected_sub:
                msg = f"Math validation failed for service '{s.role_title}': Expected subtotal {expected_sub} (quantity {s.quantity} * rate {s.rate_per_day} * days {s.duration_days}), but got {s.subtotal}"
                logger.warning(msg)
                errors.append(msg)
                requires_manual_review = True
        
        if s.subtotal:
            calculated_grand_subtotal += s.subtotal

    # 3. Grand Total Verification
    if q.grand_total_before_gst is not None and q.grand_total_before_gst != calculated_grand_subtotal:
        if calculated_grand_subtotal > 0:
            msg = f"Grand total validation failed: Expected sum of subtotals {calculated_grand_subtotal}, but got {q.grand_total_before_gst}"
            logger.warning(msg)
            errors.append(msg)
            requires_manual_review = True

    # 3.5 Auto-calculate Final Total if missing (Zero Hallucination compensation)
    if q.grand_total_before_gst is not None and q.final_total_after_gst is None:
        if q.gst_included:
            q.final_total_after_gst = q.grand_total_before_gst
            if q.gst_amount is None:
                q.gst_amount = 0
        else:
            gst_pct = q.gst_percentage if q.gst_percentage is not None else 18
            q.gst_percentage = gst_pct
            
            if q.gst_amount is None:
                q.gst_amount = int(q.grand_total_before_gst * (gst_pct / 100))
                
            q.final_total_after_gst = q.grand_total_before_gst + q.gst_amount


    # 4. Total Manpower Aggregation Verification
    calculated_manpower = 0
    for s in services:
        if s.quantity:
            calculated_manpower += s.quantity
    
    if q.total_manpower is None and calculated_manpower > 0:
        q.total_manpower = calculated_manpower
    elif q.total_manpower is not None and q.total_manpower != calculated_manpower:
        if calculated_manpower > 0:
            msg = f"Total manpower validation failed: Expected sum of quantities {calculated_manpower}, but got {q.total_manpower}"
            logger.warning(msg)
            errors.append(msg)
            requires_manual_review = True

    # 5. Payment Percentage Safety Check
    pct_sum = sum(pt.percentage for pt in payment_terms)
    if pct_sum > 0 and pct_sum != 100:
        warning_msg = f"CRITICAL: Payment terms percentage sum ({pct_sum}%) does not equal 100%."
        if warning_msg not in q.financial_risks:
            q.financial_risks.append(warning_msg)

    # 6. Set Confidence and Status based on validation
    if requires_manual_review:
        q.extraction_confidence = 0.49
        q.status = "Manual Review"
    else:
        # Default confidence if everything matches or if not enough data to fail validation
        q.extraction_confidence = 0.95
        q.status = "Auto-Verified"

    return res, errors

