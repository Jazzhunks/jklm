with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_route = """    @erp.get("/payments/{payment_id}/receipt")
    async def download_receipt(
        payment_id: str,"""
new_route = """    @erp.get("/receipts/{receipt_no}.pdf")
    async def download_receipt(
        receipt_no: str,"""

content = content.replace(old_route, new_route)

# Now fix the query inside
old_query = """        p = await db.erp_payments.find_one({"id": payment_id}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Payment not found")"""
new_query = """        # If it looks like a UUID (length 36), try matching ID for backwards compatibility
        if len(receipt_no) == 36 and "-" in receipt_no:
            p = await db.erp_payments.find_one({"id": receipt_no}, {"_id": 0})
        else:
            p = await db.erp_payments.find_one({"receipt_no": receipt_no}, {"_id": 0})
            
        if not p:
            raise HTTPException(404, "Payment/Receipt not found")"""

content = content.replace(old_query, new_query)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done")
