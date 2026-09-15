import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

new_patch = """
    @erp.patch("/payments/{payment_id}")
    async def update_payment(payment_id: str, payload: PaymentUpdate, user: dict = Depends(require_super)):
        p = await db.erp_payments.find_one({"id": payment_id}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Payment transaction not found")
        
        update_doc = {}
        if payload.mode is not None:
            update_doc["mode"] = payload.mode
        if payload.paid_at is not None:
            update_doc["paid_at"] = payload.paid_at
        if payload.notes is not None:
            update_doc["notes"] = payload.notes
        if payload.transaction_ref is not None:
            update_doc["transaction_ref"] = payload.transaction_ref
            
        if payload.amount is not None or payload.apply_gst is not None:
            new_amount = float(payload.amount) if payload.amount is not None else p.get("amount", 0.0)
            apply_gst = payload.apply_gst if payload.apply_gst is not None else (p.get("cgst", 0) > 0)
            
            if apply_gst:
                base = round(new_amount / (1 + (CGST_RATE + SGST_RATE) / 100), 2)
                cgst = round(base * CGST_RATE / 100, 2)
                sgst = round(new_amount - base - cgst, 2)
            else:
                base = new_amount
                cgst = 0.0
                sgst = 0.0
                
            update_doc["amount"] = new_amount
            update_doc["base_amount"] = base
            update_doc["cgst"] = cgst
            update_doc["sgst"] = sgst
            update_doc["cgst_rate"] = CGST_RATE if apply_gst else 0
            update_doc["sgst_rate"] = SGST_RATE if apply_gst else 0

        if not update_doc:
            return p

        update_doc["updated_at"] = now_iso()
        await db.erp_payments.update_one({"id": payment_id}, {"$set": update_doc})
        
        updated_p = await db.erp_payments.find_one({"id": payment_id}, {"_id": 0})
        await audit(user, "update", "payment", payment_id, p.get("branch_id"), {"receipt_no": p.get("receipt_no")})
        return updated_p
"""

content = content.replace(
    'return {"ok": True, "deleted_id": payment_id, "receipt_no": p.get("receipt_no")}',
    'return {"ok": True, "deleted_id": payment_id, "receipt_no": p.get("receipt_no")}\n' + new_patch
)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
