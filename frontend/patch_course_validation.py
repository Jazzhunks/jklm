import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Remove course DB validation in create_student
old_create_val = """        if not await db.centers.find_one({"id": payload.branch_id}):
            raise HTTPException(400, "Branch not found")
        if not await db.courses.find_one({"id": payload.course_id}):
            raise HTTPException(400, "Course not found")
        student_no = await gen_student_no(payload.branch_id)"""
new_create_val = """        if not await db.centers.find_one({"id": payload.branch_id}):
            raise HTTPException(400, "Branch not found")
        student_no = await gen_student_no(payload.branch_id)"""
content = content.replace(old_create_val, new_create_val)

# Remove course DB validation in update_student (if it exists)
old_update_val = """        if payload.course_id and not await db.courses.find_one({"id": payload.course_id}):
            raise HTTPException(400, "Course not found")"""
new_update_val = """        # Course validation bypassed for static mapping"""
content = content.replace(old_update_val, new_update_val)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend course validation")
