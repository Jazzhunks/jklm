import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.northend_db
    modes = await db.erp_payments.distinct("mode")
    print("Distinct modes in erp_payments:", modes)
    
    count = await db.erp_payments.count_documents({})
    print("Total payments:", count)

    sample = await db.erp_payments.find_one({})
    print("Sample payment:", sample)

asyncio.run(check())
