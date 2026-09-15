with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_func = '''    def can_view_branch(user: dict, branch_id: str) -> bool:
        if user["role"] == "super_admin":
            return True
        return user.get("branch_id") == branch_id'''

new_func = '''    def can_view_branch(user: dict, branch_id: str) -> bool:
        if user["role"] in {"super_admin", "admin"}:
            return True
        return branch_id == "all" or user.get("branch_id") == branch_id'''

content = content.replace(old_func, new_func)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching can_view_branch")
