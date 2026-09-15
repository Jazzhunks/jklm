with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

import re

old_query = 'student = await db.erp_students.find_one({"student_no": payload.student_no, "status": "active"})'
new_query = 'student = await db.erp_students.find_one({"$or": [{"student_no": payload.student_no}, {"enrollment_number": payload.student_no}], "status": "active"})'

content = content.replace(old_query, new_query)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
