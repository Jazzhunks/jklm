import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Add schema
schema = """
class TreasuryTransfer(BaseModel):
    direction: Literal["cash_to_bank", "bank_to_cash"]
    amount: float
    transfer_date: str
    branch_id: str
    deposited_by_name: str
    bank_txn_id: str
    notes: Optional[str] = None
"""
# insert schema after GstMarkPaidIn
m = re.search(r'class GstMarkPaidIn\(BaseModel\):.*?notes: Optional\[str\] = None', content, re.DOTALL)
if m:
    content = content[:m.end()] + "\n" + schema + content[m.end():]

# 2. Add routes
routes = """
    # ===== TREASURY & BANKING =====
    @erp.post("/treasury/transfers")
    async def create_treasury_transfer(payload: TreasuryTransfer, user: dict = Depends(require_finance)):
        if not can_view_branch(user, payload.branch_id):
            raise HTTPException(403, "Cross-branch denied")
        receipt_no = await gen_receipt_no(payload.branch_id)
        doc = {
            "id": new_id(),
            "receipt_no": receipt_no,
            "direction": payload.direction,
            "amount": float(payload.amount),
            "transfer_date": payload.transfer_date,
            "branch_id": payload.branch_id,
            "deposited_by_name": payload.deposited_by_name,
            "bank_txn_id": payload.bank_txn_id,
            "notes": payload.notes or "",
            "created_at": now_iso(),
            "created_by_id": user["id"],
        }
        await db.erp_treasury_transfers.insert_one(doc)
        doc.pop("_id", None)
        await audit(user, "create", "treasury_transfer", doc["id"], payload.branch_id, {"direction": payload.direction, "amount": payload.amount})
        return doc

    @erp.get("/treasury/transfers")
    async def list_treasury_transfers(branch_id: Optional[str] = None, user: dict = Depends(require_finance)):
        f = scope_branch_filter(user, branch_id)
        items = await db.erp_treasury_transfers.find(f, {"_id": 0}).sort("transfer_date", -1).to_list(1000)
        return items

    @erp.get("/treasury/summary")
    async def get_treasury_summary(branch_id: Optional[str] = None, user: dict = Depends(require_finance)):
        f = scope_branch_filter(user, branch_id)
        
        # 1. Cash In (Payments)
        cash_in_pipeline = [
            {"$match": {**f, "mode": "cash"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        cash_in_res = await db.erp_payments.aggregate(cash_in_pipeline).to_list(1)
        cash_in = cash_in_res[0]["total"] if cash_in_res else 0.0

        # 2. Bank In (Payments)
        bank_in_pipeline = [
            {"$match": {**f, "mode": {"$ne": "cash"}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        bank_in_res = await db.erp_payments.aggregate(bank_in_pipeline).to_list(1)
        bank_in = bank_in_res[0]["total"] if bank_in_res else 0.0

        # 3. Cash Out (Expenses)
        cash_out_pipeline = [
            {"$match": {**f, "payment_mode": "cash"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        cash_out_res = await db.erp_expenses.aggregate(cash_out_pipeline).to_list(1)
        cash_out = cash_out_res[0]["total"] if cash_out_res else 0.0

        # 4. Bank Out (Expenses)
        bank_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$ne": "cash"}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        bank_out_res = await db.erp_expenses.aggregate(bank_out_pipeline).to_list(1)
        bank_out = bank_out_res[0]["total"] if bank_out_res else 0.0

        # 5. Transfers
        transfers = await db.erp_treasury_transfers.find(f, {"_id": 0}).to_list(10000)
        c2b = sum(t["amount"] for t in transfers if t["direction"] == "cash_to_bank")
        b2c = sum(t["amount"] for t in transfers if t["direction"] == "bank_to_cash")

        net_cash = cash_in - cash_out - c2b + b2c
        net_bank = bank_in - bank_out + c2b - b2c

        return {
            "cash_in": cash_in,
            "cash_out": cash_out,
            "bank_in": bank_in,
            "bank_out": bank_out,
            "cash_to_bank": c2b,
            "bank_to_cash": b2c,
            "net_cash_balance": net_cash,
            "net_bank_balance": net_bank
        }
"""
# insert routes before # ===== META =====
m = re.search(r'# ===== META =====', content)
if m:
    content = content[:m.start()] + routes + "\n    " + content[m.start():]

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
