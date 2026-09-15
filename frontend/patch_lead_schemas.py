with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_propose = """class LeadProposeRequest(BaseModel):
    proposed_fee: float
    moving_to_class: Optional[str] = None
    batch_name: Optional[str] = None
    notes: Optional[str] = None"""

new_propose = """class LeadProposeRequest(BaseModel):
    proposed_fee: float
    moving_to_class: Optional[str] = None
    course: Optional[str] = None
    batch_name: Optional[str] = None
    notes: Optional[str] = None"""

old_enroll = """class LeadEnrollRequest(BaseModel):
    full_name: str
    contact_phone: str
    current_class: str
    batch: Optional[str] = None"""

new_enroll = """class LeadEnrollRequest(BaseModel):
    full_name: str
    contact_phone: str
    current_class: str
    course: Optional[str] = None
    batch: Optional[str] = None"""

content = content.replace(old_propose, new_propose).replace(old_enroll, new_enroll)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching lead schemas")
