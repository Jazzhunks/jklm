import re
with open("../backend/server.py", "r") as f:
    content = f.read()

profile_endpoint = """
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    receipt_print_size: Optional[str] = None

@api.patch("/auth/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    patch = payload.model_dump(exclude_unset=True)
    if "password" in patch:
        patch["password_hash"] = hash_password(patch.pop("password"))
    if not patch:
        return {"user": user}
    
    await db.users.update_one({"id": user["id"]}, {"$set": patch})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}
"""

if "class ProfileUpdate" not in content:
    # Insert it right before @api.post("/auth/logout")
    content = content.replace('@api.post("/auth/logout")', profile_endpoint + '\n@api.post("/auth/logout")')

with open("../backend/server.py", "w") as f:
    f.write(content)
print("Done patching backend auth profile")
