with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_func = """    def scope_branch_filter(user: dict, branch_id_param: Optional[str] = None) -> dict:
        if user["role"] == "super_admin":
            return {"branch_id": branch_id_param} if branch_id_param else {}
        if not user.get("branch_id"):
            raise HTTPException(403, "Context Error: User profile has no active branch assignment node.")
        if branch_id_param and branch_id_param != user["branch_id"]:
            raise HTTPException(403, "Access Denied: Cross-branch query parameter operations rejected.")
        return {"branch_id": user["branch_id"]}"""

new_func = """    def scope_branch_filter(user: dict, branch_id_param: Optional[str] = None) -> dict:
        if user["role"] == "super_admin":
            return {"branch_id": branch_id_param} if branch_id_param and branch_id_param != "all" else {}
        if not user.get("branch_id"):
            raise HTTPException(403, "Context Error: User profile has no active branch assignment node.")
        if branch_id_param and branch_id_param not in (user["branch_id"], "all"):
            raise HTTPException(403, "Access Denied: Cross-branch query parameter operations rejected.")
        return {"branch_id": user["branch_id"]}"""

content = content.replace(old_func, new_func)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
