with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. enroll_lead role fix
content = content.replace(
    'if user["role"] not in {"super_admin", "center_manager", "finance"}:',
    'if user["role"] not in {"super_admin", "center_manager", "accountant"}:'
)

# 2. scope_branch_filter fix
old_sbf = 'return {"branch_id": user["branch_id"]}'
new_sbf = 'return {"branch_id": {"$in": [user["branch_id"], "all"]}}'
content = content.replace(old_sbf, new_sbf)

# 3. can_view_branch fix
old_cvb = '''    def can_view_branch(user: dict, branch_id: str) -> bool:
        if user["role"] == "super_admin":
            return True
        return user.get("branch_id") == branch_id'''

new_cvb = '''    def can_view_branch(user: dict, branch_id: str) -> bool:
        if user["role"] in {"super_admin", "admin"}:
            return True
        return branch_id == "all" or user.get("branch_id") == branch_id'''
content = content.replace(old_cvb, new_cvb)

# 4. update_student fix
old_upd = '''    @erp.patch("/students/{student_id}")
    async def update_student(student_id: str, payload: StudentUpdate, user: dict = Depends(require_erp)):
        s = await db.erp_students.find_one({"$or": [{"id": student_id}, {"student_no": student_id}]}, {"_id": 0})
        if not s:
            raise HTTPException(404, "Student not found")
        real_id = s["id"]
        if user["role"] == "counsellor":
            raise HTTPException(403, "Counsellors cannot edit student records")
        if not can_view_branch(user, s["branch_id"]):
            raise HTTPException(403, "Cross-branch denied")
        patch = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
        if patch:
            await db.erp_students.update_one({"id": real_id}, {"$set": patch})'''

new_upd = '''    @erp.patch("/students/{student_id}")
    async def update_student(student_id: str, payload: StudentUpdate, user: dict = Depends(require_erp)):
        s = await db.erp_students.find_one({"$or": [{"id": student_id}, {"student_no": student_id}]}, {"_id": 0})
        if not s:
            raise HTTPException(404, "Student not found")
        real_id = s["id"]
        # Allow counsellors to edit their own students
        if user["role"] == "counsellor" and s.get("counsellor_id") != user["id"]:
            raise HTTPException(403, "Counsellors can only edit their own students")
        if not can_view_branch(user, s["branch_id"]):
            raise HTTPException(403, "Cross-branch denied")
        patch = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
        
        # Disable financial overrides for non-super admins
        if user["role"] != "super_admin":
            patch.pop("total_fee", None)
            patch.pop("scholarship_percent", None)
            patch.pop("discount", None)

        if patch:
            await db.erp_students.update_one({"id": real_id}, {"$set": patch})'''
content = content.replace(old_upd, new_upd)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done safe patch")
