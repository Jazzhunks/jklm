import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

pinelabs_routes = """
    # ===== PINE LABS EDC INTEGRATION =====
    @erp.post("/payments/{payment_id}/pinelabs/push")
    async def pinelabs_push(payment_id: str, user: dict = Depends(require_erp)):
        p = await db.erp_payments.find_one({"id": payment_id}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Payment not found")
        if p["status"] == "paid":
            raise HTTPException(400, "Payment already completed")
            
        branch = await db.centers.find_one({"id": p["branch_id"]})
        if not branch:
            raise HTTPException(404, "Branch not found")
            
        merchant_id = branch.get("pinelabs_merchant_id")
        secret = branch.get("pinelabs_secret")
        imei = branch.get("pinelabs_imei")
        
        if not merchant_id or not imei:
            raise HTTPException(400, "Pine Labs is not configured for this branch. Please add Merchant ID and EDC IMEI in Branch Settings.")
            
        from pine_labs_client import push_transaction
        res = await push_transaction(p["amount"], p["receipt_no"], imei, merchant_id, secret)
        
        # Mark payment as pending EDC response
        await db.erp_payments.update_one({"id": payment_id}, {"$set": {"edc_status": "QUEUED", "edc_txn_id": res.get("plutus_txn_id")}})
        return res

    @erp.get("/payments/{payment_id}/pinelabs/status")
    async def pinelabs_status(payment_id: str, user: dict = Depends(require_erp)):
        p = await db.erp_payments.find_one({"id": payment_id}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Payment not found")
            
        branch = await db.centers.find_one({"id": p["branch_id"]})
        merchant_id = branch.get("pinelabs_merchant_id", "")
        secret = branch.get("pinelabs_secret", "")
        imei = branch.get("pinelabs_imei", "")
        
        from pine_labs_client import check_status
        res = await check_status(p["receipt_no"], imei, merchant_id, secret)
        
        if res.get("status") == "APPROVED":
            await db.erp_payments.update_one({"id": payment_id}, {"$set": {"status": "paid", "edc_status": "APPROVED", "payment_mode": "Pine Labs EDC"}})
        
        return res

    @erp.get("/payments")"""

content = content.replace('    @erp.get("/payments")', pinelabs_routes)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching pinelabs routes")
