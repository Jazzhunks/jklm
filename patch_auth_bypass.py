import re

with open("backend/server.py", "r") as f:
    text = f.read()

# 1. Update verify_otp to set verified: True
old_verify_reg = """    elif payload.action == "register":
        # Just return ok, meaning frontend can proceed with creating account
        await db.otps.delete_one({"_id": record["_id"]})
        return {"ok": True}"""

new_verify_reg = """    elif payload.action == "register":
        await db.otps.update_one({"_id": record["_id"]}, {"$set": {"verified": True}})
        return {"ok": True}"""

text = text.replace(old_verify_reg, new_verify_reg)

# 2. Update register to check verified OTP
old_register_start = """    if payload.phone and await db.users.find_one({"phone": payload.phone.strip()}):
        raise HTTPException(400, "Phone number already registered")
    user_id = new_id()"""

new_register_start = """    if payload.phone and await db.users.find_one({"phone": payload.phone.strip()}):
        raise HTTPException(400, "Phone number already registered")
        
    if payload.phone:
        otp_record = await db.otps.find_one({"phone": payload.phone.strip(), "action": "register", "verified": True})
        if not otp_record:
            raise HTTPException(400, "Phone number not verified via OTP")
        await db.otps.delete_one({"_id": otp_record["_id"]})

    user_id = new_id()"""

text = text.replace(old_register_start, new_register_start)

with open("backend/server.py", "w") as f:
    f.write(text)

