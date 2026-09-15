import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Remove the pending status assignment in create_payment
old_paid_at = """            "paid_at": now_iso(),
            "status": "pending" if payload.mode == "pine_labs_edc" else "paid",
        }"""
new_paid_at = """            "paid_at": now_iso(),
        }"""
content = content.replace(old_paid_at, new_paid_at)

# 2. Replace pinelabs/push and pinelabs/status with pinelabs/print
routes_regex = re.compile(r'    # ===== PINE LABS EDC INTEGRATION =====.*?@erp\.get\("/payments"\)', re.DOTALL)

new_routes = """    # ===== PINE LABS EDC INTEGRATION =====
    @erp.post("/payments/{payment_id}/pinelabs/print")
    async def pinelabs_print(payment_id: str, user: dict = Depends(require_erp)):
        p = await db.erp_payments.find_one({"id": payment_id}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Payment not found")
            
        branch = await db.centers.find_one({"id": p["branch_id"]})
        if not branch:
            raise HTTPException(404, "Branch not found")
            
        merchant_id = branch.get("pinelabs_merchant_id")
        secret = branch.get("pinelabs_secret")
        imei = branch.get("pinelabs_imei")
        
        if not merchant_id or not imei:
            raise HTTPException(400, "Pine Labs is not configured for this branch. Please add Merchant ID and EDC IMEI in Branch Settings.")
            
        from pine_labs_client import print_receipt
        res = await print_receipt(p, branch.get("name", "Northend Educational World"), imei, merchant_id, secret)
        
        return res

    @erp.get("/payments")"""

content = routes_regex.sub(new_routes, content)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend routes for EDC print")
