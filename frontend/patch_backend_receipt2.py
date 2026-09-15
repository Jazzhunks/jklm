with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

import re

# We want to change `@erp.get("/receipts/{receipt_no}.pdf")` to `@erp.get("/receipts/{receipt_no:path}")`
# And remove `user: dict = Depends(require_erp),`
# And strip `.pdf` from receipt_no inside the function.

old_func = """    @erp.get("/receipts/{receipt_no}.pdf")
    async def download_receipt(
        receipt_no: str,
        format: Optional[str] = Query("a4"),
        width_mm: Optional[int] = Query(80),
        user: dict = Depends(require_erp),
    ):
        # If it looks like a UUID (length 36), try matching ID for backwards compatibility
        if len(receipt_no) == 36 and "-" in receipt_no:"""

new_func = """    @erp.get("/receipts/{receipt_no:path}")
    async def download_receipt(
        receipt_no: str,
        format: Optional[str] = Query("a4"),
        width_mm: Optional[int] = Query(80),
        user: dict = Depends(get_current_user), # Use get_current_user which can be None if not provided
    ):
        # Strip .pdf if present
        if receipt_no.endswith(".pdf"):
            receipt_no = receipt_no[:-4]
            
        # If it looks like a UUID (length 36), try matching ID for backwards compatibility
        if len(receipt_no) == 36 and "-" in receipt_no:"""

content = content.replace(old_func, new_func)

# Fix audit call since user can be None
old_audit = 'await audit(user, "download", "receipt", p["id"], p["branch_id"], {"format": fmt_tag})'
new_audit = 'if user:\n            await audit(user, "download", "receipt", p["id"], p["branch_id"], {"format": fmt_tag})'
content = content.replace(old_audit, new_audit)

# Also fix `can_view_branch` check since user can be None
old_can_view = """        if not can_view_branch(user, p["branch_id"]):
            raise HTTPException(403, "Cross-branch denied")"""
new_can_view = """        # If user is logged in, check branch access. Otherwise, it's a public download.
        if user and not can_view_branch(user, p["branch_id"]):
            raise HTTPException(403, "Cross-branch denied")"""
content = content.replace(old_can_view, new_can_view)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done")
