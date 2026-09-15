with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_func = """    @erp.get("/receipts/{receipt_no:path}")
    async def download_receipt(
        receipt_no: str,
        format: Optional[str] = Query("a4"),
        width_mm: Optional[int] = Query(80),
        user: dict = Depends(get_current_user), # Use get_current_user which can be None if not provided
    ):"""

new_func = """    @erp.get("/receipts/{receipt_no:path}")
    async def download_receipt(
        receipt_no: str,
        request: Request,
        format: Optional[str] = Query("a4"),
        width_mm: Optional[int] = Query(80)
    ):
        # Attempt to get user silently for audit purposes
        user = None
        try:
            user = await get_current_user(request)
        except Exception:
            pass"""

content = content.replace(old_func, new_func)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done")
