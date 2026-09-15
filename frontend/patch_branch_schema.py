with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_branch_update = """class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    signatory_name: Optional[str] = None
    state_code: Optional[str] = None
    manager_user_id: Optional[str] = None"""

new_branch_update = """class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    signatory_name: Optional[str] = None
    state_code: Optional[str] = None
    manager_user_id: Optional[str] = None
    pinelabs_merchant_id: Optional[str] = None
    pinelabs_secret: Optional[str] = None
    pinelabs_imei: Optional[str] = None"""

content = content.replace(old_branch_update, new_branch_update)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching BranchUpdate schema")
