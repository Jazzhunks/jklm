import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.northend_db
    
    # Check total cash in
    cash_pipeline = [{"$match": {"mode": "cash"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    res = await db.erp_payments.aggregate(cash_pipeline).to_list(1)
    print("Total Cash Payments:", res)
    
    bank_pipeline = [{"$match": {"mode": {"$ne": "cash"}}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    res2 = await db.erp_payments.aggregate(bank_pipeline).to_list(1)
    print("Total Bank Payments:", res2)

asyncio.run(run())
