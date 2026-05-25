from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DepartmentEnum(str, Enum):
    MAWAID = "Mawaid"
    AVIT = "AVIT"
    SEHAT = "Sehat"
    FIRE_SAFETY = "Fire Safety"
    FLOW_MGMT = "Flow Mgmt"
    KARAMAT = "Karamat"
    SABEEL = "Sabeel"
    TRANSPORT = "Transport"
    SECURITY = "Security"
    NAZAFAT = "Nazafat"
    TAZYEEN = "Tazyeen"
    UNCLASSIFIED = "UNCLASSIFIED"

class Quotation(BaseModel):
    quotation_id: Optional[str] = Field(None, description="Unique reference number or ID of the quotation document itself")
    source_file_name: Optional[str] = Field(None, description="The name of the PDF file being extracted")
    agency_name: Optional[str] = Field(None, description="Name of the service provider or vendor organization sending the quotation")
    event_name: Optional[str] = Field(None, description="The name of the event or project this quotation is generated for")
    quotation_type: Optional[str] = Field(None, description="Type of services quoted, e.g. Housekeeping, Security, Production, Catering")
    event_location: Optional[str] = Field(None, description="Venue or location details where services will be rendered")
    contact_person: Optional[str] = Field(None, description="Primary representative or contact person name from the vendor side")
    contact_email: Optional[str] = Field(None, description="Official email address of the contact person or vendor")
    contact_phone: Optional[str] = Field(None, description="Official contact phone/mobile number")
    grand_total_before_gst: Optional[int] = Field(None, description="Grand total amount excluding all taxes/GST")
    gst_percentage: Optional[int] = Field(None, description="Standard GST or tax rate applied, usually as a percentage")
    gst_amount: Optional[int] = Field(None, description="Calculated tax amount applied to the services")
    final_total_after_gst: Optional[int] = Field(None, description="Absolute total billing amount including GST")
    gst_included: Optional[bool] = Field(None, description="Whether the quoted prices explicitly include GST/taxes")
    quotation_validity_days: Optional[int] = Field(None, description="Number of days the quotation prices remain valid for acceptance")
    total_services: Optional[int] = Field(None, description="Count of distinct departments or core services outlined in the quotation")
    total_manpower: Optional[int] = Field(None, description="Sum of all personnel/manpower headcount requested across all departments")
    quotation_summary: Optional[str] = Field(None, description="Brief enterprise executive summary of the entire quotation scope")
    operational_notes: List[str] = Field(default_factory=list, description="General operational timelines, execution conditions, and constraints")
    client_obligations: List[str] = Field(default_factory=list, description="Explicit duties, resources, or provisions the client must supply")
    financial_risks: List[str] = Field(default_factory=list, description="Commercial liabilities, extra charges, and payment penalties identified")
    operational_risks: List[str] = Field(default_factory=list, description="Execution risks, shortage of staff, transport dependencies, and weather variables")
    extraction_confidence: Optional[float] = Field(None, description="Calculated machine-learning confidence index for structured parsing")
    status: Optional[str] = Field(None, description="Verification status of the quotation (e.g., 'Manual Review', 'Auto-Verified')")

class QuotationService(BaseModel):
    service_id: Optional[str] = Field(None, description="Unique index or key of the service department")
    department_name: Optional[DepartmentEnum] = Field(None, description="Standardized department/domain name, e.g. Housekeeping, Security, Stage Crew")
    role_title: Optional[str] = Field(None, description="Specific title of the service package or line-item designation")
    quantity: Optional[int] = Field(None, description="Number of personnel allocated for this specific service department")
    manpower_type: Optional[str] = Field(None, description="Type/grade of staff allocated, e.g. Supervisor, Executive, Loader, Guard")
    duration_days: Optional[int] = Field(None, description="Number of days this service/manpower is contracted for")
    shifts_per_day: Optional[int] = Field(None, description="Number of distinct operational shifts run per 24 hours")
    shift_timings: List[str] = Field(default_factory=list, description="Shift timings or slot brackets, e.g. 08:00-17:00, 20:00-05:00")
    quantity_description: Optional[str] = Field(None, description="Textual description of quantity, unit, or operational scope")
    rate_per_day: Optional[int] = Field(None, description="Commercial unit rate charged per staff per day or shift")
    subtotal: Optional[int] = Field(None, description="Subtotal amount for this specific service item (excluding tax)")
    service_scope: List[str] = Field(default_factory=list, description="List of primary tasks, items, or requirements included in this service")
    equipment_included: List[str] = Field(default_factory=list, description="List of vendor machines, toolsets, or equipment supplied")
    service_responsibilities: List[str] = Field(default_factory=list, description="Standard operating duties and key performance responsibilities")
    remarks: Optional[str] = Field(None, description="Any specific notes or exclusions related to this department service")

class PaymentTerm(BaseModel):
    stage_name: str = Field(..., description="Milestone phase title, e.g. Advance Payment, Post-Event Settlement")
    percentage: int = Field(..., description="Percentage of the absolute total billing due in this phase, e.g. 50")

class StructuredQuotationResponse(BaseModel):
    quotation_meta: Quotation
    line_items: List[QuotationService]
    payment_terms: List[PaymentTerm]
