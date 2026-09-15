import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Replace the entire get_treasury_summary with a simpler, 100% reliable implementation
old_fn = """    @erp.get("/treasury/summary")
    async def get_treasury_summary(branch_id: Optional[str] = None, user: dict = Depends(require_finance)):
        f = scope_branch_filter(user, branch_id)
        
        # 1. Cash In (Payments)
        cash_in_pipeline = [
            {"$match": {**f, "mode": {"$regex": "^cash$", "$options": "i"}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]
        cash_in_res = await db.erp_payments.aggregate(cash_in_pipeline).to_list(1)
        cash_in = cash_in_res[0]["total"] if cash_in_res else 0.0

        # 2. Bank In (Payments)
        bank_in_pipeline = [
            {"$match": {**f, "mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]
        bank_in_res = await db.erp_payments.aggregate(bank_in_pipeline).to_list(1)
        bank_in = bank_in_res[0]["total"] if bank_in_res else 0.0

        # 3. Cash Out (Expenses)
        cash_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$regex": "^cash$", "$options": "i"}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]
        cash_out_res = await db.erp_expenses.aggregate(cash_out_pipeline).to_list(1)
        cash_out = cash_out_res[0]["total"] if cash_out_res else 0.0

        # 4. Bank Out (Expenses)
        bank_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]
        bank_out_res = await db.erp_expenses.aggregate(bank_out_pipeline).to_list(1)
        bank_out = bank_out_res[0]["total"] if bank_out_res else 0.0

        # 5. Transfers
        transfers = await db.erp_treasury_transfers.find(f, {"_id": 0}).to_list(10000)
        c2b = sum(t["amount"] for t in transfers if t["direction"] == "cash_to_bank")
        b2c = sum(t["amount"] for t in transfers if t["direction"] == "bank_to_cash")

        net_cash = cash_in - cash_out - c2b + b2c"""

new_fn = """    @erp.get("/treasury/summary")
    async def get_treasury_summary(branch_id: Optional[str] = None, user: dict = Depends(require_finance)):
        f = scope_branch_filter(user, branch_id)
        
        # Load all payments and tally in Python to avoid type mismatch issues with MongoDB $sum
        all_payments = await db.erp_payments.find(f, {"_id": 0, "mode": 1, "amount": 1}).to_list(100000)
        cash_in = sum(float(p.get("amount") or 0) for p in all_payments if str(p.get("mode", "")).lower() == "cash")
        bank_in = sum(float(p.get("amount") or 0) for p in all_payments if str(p.get("mode", "")).lower() != "cash")

        # Load all expenses and tally
        all_expenses = await db.erp_expenses.find(f, {"_id": 0, "payment_mode": 1, "amount": 1}).to_list(100000)
        cash_out = sum(float(e.get("amount") or 0) for e in all_expenses if str(e.get("payment_mode", "")).lower() == "cash")
        bank_out = sum(float(e.get("amount") or 0) for e in all_expenses if str(e.get("payment_mode", "")).lower() != "cash")

        # Transfers
        transfers = await db.erp_treasury_transfers.find(f, {"_id": 0}).to_list(10000)
        c2b = sum(float(t.get("amount") or 0) for t in transfers if t["direction"] == "cash_to_bank")
        b2c = sum(float(t.get("amount") or 0) for t in transfers if t["direction"] == "bank_to_cash")

        net_cash = cash_in - cash_out - c2b + b2c"""

content = content.replace(old_fn, new_fn)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
