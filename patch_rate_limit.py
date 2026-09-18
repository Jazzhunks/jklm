import re

with open("backend/server.py", "r") as f:
    text = f.read()

# 1. Update send_otp to reset attempts
text = text.replace(
    '{"$set": {"code": code, "expires_at": expires_at}},',
    '{"$set": {"code": code, "expires_at": expires_at, "attempts": 0}},'
)

# 2. Update verify_otp to check and increment attempts
old_verify = """    if not record:
        raise HTTPException(400, "OTP not found for this number/action")
    if record["code"] != payload.code:
        raise HTTPException(400, f"OTP mismatch (expected {record['code']}, got {payload.code})")
    if record["expires_at"] < datetime.utcnow():"""

new_verify = """    if not record:
        raise HTTPException(400, "OTP not found for this number/action")
        
    attempts = record.get("attempts", 0)
    if attempts >= 5:
        await db.otps.delete_one({"_id": record["_id"]})
        raise HTTPException(429, "Too many failed attempts. Please request a new OTP.")
        
    if record["code"] != payload.code:
        await db.otps.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, f"OTP mismatch (expected {record['code']}, got {payload.code})")
        
    if record["expires_at"] < datetime.utcnow():"""

text = text.replace(old_verify, new_verify)

# 3. Update reset_password to do the same
old_reset = """    if not record:
        raise HTTPException(400, "OTP not found for this number/action")
    if record["code"] != payload.code:
        raise HTTPException(400, f"OTP mismatch (expected {record['code']}, got {payload.code})")
    if record["expires_at"] < datetime.utcnow():"""

new_reset = """    if not record:
        raise HTTPException(400, "OTP not found for this number/action")
        
    attempts = record.get("attempts", 0)
    if attempts >= 5:
        await db.otps.delete_one({"_id": record["_id"]})
        raise HTTPException(429, "Too many failed attempts. Please request a new OTP.")
        
    if record["code"] != payload.code:
        await db.otps.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, f"OTP mismatch (expected {record['code']}, got {payload.code})")
        
    if record["expires_at"] < datetime.utcnow():"""

text = text.replace(old_reset, new_reset)

with open("backend/server.py", "w") as f:
    f.write(text)

