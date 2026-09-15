with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Fix finance -> accountant in enroll_lead
old_line = 'if user["role"] not in {"super_admin", "center_manager", "finance"}:'
new_line = 'if user["role"] not in {"super_admin", "center_manager", "accountant"}:'
content = content.replace(old_line, new_line)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching finance role")
