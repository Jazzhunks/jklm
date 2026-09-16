import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Add lookup endpoint
lookup_endpoint = """    @erp.get("/students/lookup")
    async def lookup_student_data(phone: str, user: dict = Depends(require_erp)):
        phone = phone.strip()
        if not phone:
            return {"type": "none"}
            
        # Check student first
        student = await db.erp_students.find_one({"contact_phone": phone, "status": {"$ne": "deleted"}}, {"_id": 0})
        if student:
            return {"type": "student", "data": student}
            
        # Check lead
        lead = await db.erp_leads.find_one({"phone": phone, "status": {"$ne": "deleted"}}, {"_id": 0})
        if lead:
            return {"type": "lead", "data": lead}
            
        # Check scholarship application
        scholarship = await db.scholarship_applications.find_one({"phone": phone}, {"_id": 0})
        if scholarship:
            return {"type": "scholarship", "data": scholarship}
            
        return {"type": "none"}

    @erp.post("/students")"""
content = re.sub(r'    @erp\.post\("/students"\)', lookup_endpoint, content)

# 2. Add uniqueness checks to create_student
old_create_checks = """        student_no = await gen_student_no(payload.branch_id)
        try:
            doc = payload.model_dump(exclude_none=True)"""
new_create_checks = """        # Check uniqueness for phone and email
        if payload.contact_phone and await db.erp_students.find_one({"contact_phone": payload.contact_phone, "status": {"$ne": "deleted"}}):
            raise HTTPException(400, "A student with this mobile number already exists.")
        if payload.contact_email and await db.erp_students.find_one({"contact_email": payload.contact_email, "status": {"$ne": "deleted"}}):
            raise HTTPException(400, "A student with this email already exists.")

        student_no = await gen_student_no(payload.branch_id)
        try:
            doc = payload.model_dump(exclude_none=True)"""
content = content.replace(old_create_checks, new_create_checks)

# 3. Add uniqueness checks to update_student
old_update_checks = """        if not can_view_branch(user, existing["branch_id"]):
            raise HTTPException(403, "Cross-branch denied")
        
        # Course validation bypassed for static mapping
        try:
            doc = payload.model_dump(exclude_unset=True)"""
new_update_checks = """        if not can_view_branch(user, existing["branch_id"]):
            raise HTTPException(403, "Cross-branch denied")
            
        if payload.contact_phone and payload.contact_phone != existing.get("contact_phone"):
            if await db.erp_students.find_one({"contact_phone": payload.contact_phone, "status": {"$ne": "deleted"}, "id": {"$ne": student_id}}):
                raise HTTPException(400, "A student with this mobile number already exists.")
        if payload.contact_email and payload.contact_email != existing.get("contact_email"):
            if await db.erp_students.find_one({"contact_email": payload.contact_email, "status": {"$ne": "deleted"}, "id": {"$ne": student_id}}):
                raise HTTPException(400, "A student with this email already exists.")
        
        # Course validation bypassed for static mapping
        try:
            doc = payload.model_dump(exclude_unset=True)"""
content = content.replace(old_update_checks, new_update_checks)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend for phone logic")
