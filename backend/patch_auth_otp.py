import re
with open("server.py", "r") as f:
    content = f.read()

otp_models = """
class SendOtpIn(BaseModel):
    phone: str
    action: str = "login" # "login", "register", "forgot"

class VerifyOtpIn(BaseModel):
    phone: str
    code: str
    action: str = "login"

class ResetPasswordIn(BaseModel):
    phone: str
    code: str
    new_password: str
"""
if "class SendOtpIn" not in content:
    content = content.replace("class LoginIn(BaseModel):", otp_models + "\nclass LoginIn(BaseModel):")

# Add import for whatsapp client
if "from whatsapp_client import send_whatsapp_otp" not in content:
    content = content.replace("from whatsapp_client import", "from whatsapp_client import send_whatsapp_otp,")

otp_endpoints = """
import random
from datetime import timedelta

@api.post("/auth/send-otp")
async def send_otp(payload: SendOtpIn):
    phone = payload.phone.strip()
    # Check if user exists based on action
    user = await db.users.find_one({"phone": phone})
    if payload.action in ("login", "forgot") and not user:
        raise HTTPException(404, "Phone number not registered")
    if payload.action == "register" and user:
        raise HTTPException(400, "Phone number already registered")
        
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    await db.otps.update_one(
        {"phone": phone, "action": payload.action},
        {"$set": {"code": code, "expires_at": expires_at}},
        upsert=True
    )
    
    success = await send_whatsapp_otp(phone, code)
    if not success:
        raise HTTPException(500, "Failed to send WhatsApp message")
    return {"ok": True, "message": "OTP sent via WhatsApp"}

@api.post("/auth/verify-otp")
async def verify_otp(payload: VerifyOtpIn):
    phone = payload.phone.strip()
    record = await db.otps.find_one({"phone": phone, "action": payload.action})
    
    if not record or record["code"] != payload.code or record["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired OTP")
        
    if payload.action == "login":
        user = await db.users.find_one({"phone": phone})
        if not user: raise HTTPException(404, "User not found")
        # Clean OTP
        await db.otps.delete_one({"_id": record["_id"]})
        # Generate token
        access = create_access_token({"sub": user["id"], "role": user.get("role", "student")})
        # We also want to set cookies if needed, but LoginIn does it differently maybe?
        # Actually, let's just return what standard login returns
        doc = dict(user); doc.pop("_id", None); doc.pop("password_hash", None)
        return {"user": doc, "access_token": access}
        
    elif payload.action == "register":
        # Just return ok, meaning frontend can proceed with creating account
        await db.otps.delete_one({"_id": record["_id"]})
        return {"ok": True}
        
    return {"ok": True}

@api.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordIn):
    phone = payload.phone.strip()
    record = await db.otps.find_one({"phone": phone, "action": "forgot"})
    
    if not record or record["code"] != payload.code or record["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired OTP")
        
    user = await db.users.find_one({"phone": phone})
    if not user: raise HTTPException(404, "User not found")
    
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    await db.otps.delete_one({"_id": record["_id"]})
    return {"ok": True, "message": "Password updated successfully"}
"""

if "@api.post(\"/auth/send-otp\")" not in content:
    content = content.replace("@api.post(\"/auth/login\")", otp_endpoints + "\n@api.post(\"/auth/login\")")
    
# Seed OTP index
if 'db.otps.create_index("expires_at", expireAfterSeconds=0)' not in content:
    content = content.replace('await db.users.create_index("phone", unique=True, sparse=True)', 'await db.users.create_index("phone", unique=True, sparse=True)\n    await db.otps.create_index("expires_at", expireAfterSeconds=0)')

with open("server.py", "w") as f:
    f.write(content)
print("Done patching server.py")
