with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_return = 'return {"branch_id": user["branch_id"]}'
new_return = 'return {"branch_id": {"$in": [user["branch_id"], "all"]}}'
content = content.replace(old_return, new_return)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching scope_branch_filter")
