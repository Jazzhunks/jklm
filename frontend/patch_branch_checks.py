import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

def replace_branch_check(text):
    old_check = 'if user["role"] != "super_admin" and lead.get("branch_id") != user.get("branch_id"):\n            raise HTTPException(403, "Cross-branch denied")'
    new_check = 'if user["role"] not in {"super_admin", "admin"} and lead.get("branch_id") not in {"all", user.get("branch_id")}:\n            raise HTTPException(403, "Cross-branch denied")'
    return text.replace(old_check, new_check)

def replace_branch_check2(text):
    old_check = 'if user["role"] != "super_admin" and l.get("branch_id") != user.get("branch_id"):\n            raise HTTPException(403, "Cross-branch denied")'
    new_check = 'if user["role"] not in {"super_admin", "admin"} and l.get("branch_id") not in {"all", user.get("branch_id")}:\n            raise HTTPException(403, "Cross-branch denied")'
    return text.replace(old_check, new_check)

content = replace_branch_check(content)
content = replace_branch_check2(content)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching branch checks")
