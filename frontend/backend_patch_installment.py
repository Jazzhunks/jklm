import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

import os
from dotenv import load_dotenv
load_dotenv("../backend/.env")

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "northend_db")

async def run():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    students = await db.erp_payments.distinct("student_id")
    for st in students:
        payments = await db.erp_payments.find({"student_id": st}).sort("paid_at", 1).to_list(500)
        for i, p in enumerate(payments):
            await db.erp_payments.update_one({"id": p["id"]}, {"$set": {"installment_no": i + 1}})
    print("Done updating installments")

asyncio.run(run())
