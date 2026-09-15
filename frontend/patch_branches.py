with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_branches = """    @erp.get("/branches")
    async def list_branches(user: dict = Depends(require_erp)):
        if user["role"] == "super_admin":
            items = await db.centers.find({}, {"_id": 0}).to_list(200)
        else:
            if not user.get("branch_id"):
                return []
            items = await db.centers.find({"id": user["branch_id"]}, {"_id": 0}).to_list(10)
        return items"""

new_branches = """    @erp.get("/branches")
    async def list_branches(user: dict = Depends(require_erp)):
        # Everyone can see branches (e.g. for Lead Transfer)
        items = await db.centers.find({}, {"_id": 0, "name": 1, "id": 1, "prefix": 1}).to_list(200)
        return items"""

content = content.replace(old_branches, new_branches)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend branches")
