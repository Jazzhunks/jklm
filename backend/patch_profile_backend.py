import re

with open("server.py", "r") as f:
    content = f.read()

# 1. Update ProfileUpdate model
content = content.replace(
"""class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    receipt_print_size: Optional[str] = None""",
"""class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    receipt_print_size: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    otp_code: Optional[str] = None"""
)

# 2. Update PATCH /auth/profile to verify OTP if phone is changed
old_patch = """@api.patch("/auth/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    patch = payload.model_dump(exclude_unset=True)
    if "password" in patch:
        patch["password_hash"] = hash_password(patch.pop("password"))
    if not patch:
        return {"user": user}
    
    await db.users.update_one({"id": user["id"]}, {"$set": patch})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}"""

new_patch = """@api.patch("/auth/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    patch = payload.model_dump(exclude_unset=True)
    
    # If phone is being updated, we MUST verify the OTP sent to that NEW phone
    if "phone" in patch and patch["phone"] != user.get("phone"):
        new_phone = patch["phone"]
        code = patch.pop("otp_code", None)
        if not code:
            raise HTTPException(400, "otp_code is required when changing phone number")
        
        # Verify OTP
        record = await db.otps.find_one({"phone": new_phone, "action": "update_phone"})
        if not record or record["code"] != code or record["expires_at"] < datetime.utcnow():
            raise HTTPException(400, "Invalid or expired OTP for new phone number")
            
        # Clean OTP
        await db.otps.delete_one({"_id": record["_id"]})
        
        # Check if phone is already taken by another user
        existing = await db.users.find_one({"phone": new_phone})
        if existing and existing["id"] != user["id"]:
            raise HTTPException(400, "Phone number is already registered to another account")

    if "password" in patch:
        patch["password_hash"] = hash_password(patch.pop("password"))
    
    # Remove otp_code from patch if it wasn't popped
    patch.pop("otp_code", None)

    if not patch:
        return {"user": user}
    
    await db.users.update_one({"id": user["id"]}, {"$set": patch})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}"""

content = content.replace(old_patch, new_patch)

# 3. Add "update_phone" to allowed actions in send_otp
content = content.replace('if payload.action in ("login", "forgot") and not user:', 'if payload.action in ("login", "forgot") and not user:')

# Wait, `send_otp` has this:
# if payload.action in ("login", "forgot") and not user:
#     raise HTTPException(404, "Phone number not registered")
# if payload.action == "register" and user:
#     raise HTTPException(400, "Phone number already registered")
#
# I need to add update_phone to the register block so it doesn't fail if the user is registered?
# Actually, if they are changing to a new phone, it SHOULD NOT be registered.
old_send_otp_check = """    if payload.action in ("login", "forgot") and not user:
        raise HTTPException(404, "Phone number not registered")
    if payload.action == "register" and user:
        raise HTTPException(400, "Phone number already registered")"""

new_send_otp_check = """    if payload.action in ("login", "forgot") and not user:
        raise HTTPException(404, "Phone number not registered")
    if payload.action in ("register", "update_phone") and user:
        raise HTTPException(400, "Phone number already registered to another account")"""

content = content.replace(old_send_otp_check, new_send_otp_check)

with open("server.py", "w") as f:
    f.write(content)
print("Backend profile patched")
