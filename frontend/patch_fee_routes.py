import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Add fee matrix routes before the ERP PAYMENTS section
routes_addition = """
    # ===== FEE MATRIX (GLOBAL SETTINGS) =====
    @erp.get("/fee-matrix")
    async def get_fee_matrix(user: dict = Depends(require_erp)):
        doc = await db.erp_settings.find_one({"id": "fee_matrix"}, {"_id": 0})
        if not doc:
            return {"matrix": {}}
        return doc
        
    @erp.post("/fee-matrix")
    async def update_fee_matrix(payload: dict, user: dict = Depends(require_super)):
        matrix = payload.get("matrix", {})
        await db.erp_settings.update_one(
            {"id": "fee_matrix"},
            {"$set": {"matrix": matrix}},
            upsert=True
        )
        return {"ok": True, "matrix": matrix}
        
    # ===== PAYMENTS / RECEIPTS =====
"""

content = content.replace("    # ===== PAYMENTS / RECEIPTS =====", routes_addition)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend fee routes")
