import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.ai.schemas import StructuredQuotationResponse, Quotation, QuotationService, PaymentTerm, DepartmentEnum
from app.ai.validators import validate_quotation

def test_validation():
    # Test case 1: valid math
    q1 = Quotation(
        quotation_id="Q-001",
        grand_total_before_gst=10000,
        total_manpower=10
    )
    s1 = QuotationService(
        role_title="Test Service",
        department_name=DepartmentEnum.SECURITY,
        quantity=10,
        rate_per_day=100,
        duration_days=10,
        subtotal=10000
    )
    p1 = PaymentTerm(stage_name="Advance", percentage=100)
    
    res1 = StructuredQuotationResponse(quotation_meta=q1, line_items=[s1], payment_terms=[p1])
    validated1, errors1 = validate_quotation(res1)
    print("Test 1 Status:", validated1.quotation_meta.status)
    print("Test 1 Confidence:", validated1.quotation_meta.extraction_confidence)
    assert validated1.quotation_meta.status == "Auto-Verified"
    assert validated1.quotation_meta.extraction_confidence == 0.95
    assert len(errors1) == 0

    # Test case 2: invalid math (backend calc != extracted subtotal)
    q2 = Quotation(
        quotation_id="Q-002",
        grand_total_before_gst=10000,
        total_manpower=10
    )
    s2 = QuotationService(
        role_title="Test Service",
        department_name=DepartmentEnum.UNCLASSIFIED,
        quantity=10,
        rate_per_day=100, # 10 * 100 * 10 = 10000
        duration_days=10,
        subtotal=9000  # Invalid!
    )
    res2 = StructuredQuotationResponse(quotation_meta=q2, line_items=[s2], payment_terms=[p1])
    validated2, errors2 = validate_quotation(res2)
    print("Test 2 Status:", validated2.quotation_meta.status)
    print("Test 2 Confidence:", validated2.quotation_meta.extraction_confidence)
    assert validated2.quotation_meta.status == "Manual Review"
    assert validated2.quotation_meta.extraction_confidence == 0.49
    assert len(errors2) > 0
    
    print("All tests passed!")

if __name__ == "__main__":
    test_validation()
