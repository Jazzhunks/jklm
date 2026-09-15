import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "northend_db"

async def check():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    sample = await db.erp_payments.find_one({})
    if sample:
        print(sample.keys())
    else:
        print("No payments")

asyncio.run(check())
