import re

with open('backend/server.py', 'r') as f:
    server = f.read()

fcm_init = """
import firebase_admin
from firebase_admin import credentials, messaging
try:
    cred = credentials.Certificate("northend-admin-app-firebase-adminsdk-fbsvc-79accbd4db.json")
    firebase_admin.initialize_app(cred)
    print("Firebase Admin initialized successfully.")
except Exception as e:
    print(f"Firebase initialization failed: {e}")

from pydantic import BaseModel
class FCMTokenIn(BaseModel):
    token: str

@app.post("/api/erp/users/fcm-token")
async def update_fcm_token(req: FCMTokenIn, user=Depends(get_current_user)):
    await db.users.update_one({"_id": user["_id"]}, {"$addToSet": {"fcm_tokens": req.token}})
    return {"success": True}

async def send_super_admin_notification(title: str, body: str, target_path: str = ""):
    try:
        admins = await db.users.find({"role": "super_admin"}).to_list(None)
        tokens = []
        for admin in admins:
            tokens.extend(admin.get("fcm_tokens", []))
        
        tokens = list(set(tokens))
        if not tokens:
            return
            
        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={"target_path": target_path},
            tokens=tokens
        )
        response = messaging.send_multicast(message)
        print(f"Successfully sent FCM messages: {response.success_count}")
    except Exception as e:
        print(f"Error sending FCM: {e}")
"""

if "import firebase_admin" not in server:
    server = server.replace('app = FastAPI(', fcm_init + '\napp = FastAPI(')

# Registration hook
reg_hook = """
        await send_super_admin_notification(
            title="New User Registration",
            body=f"{req.name} just registered as {req.role}.",
            target_path="/admin/users"
        )
"""
server = server.replace('return {"msg": "User created successfully"}', reg_hook + '\n    return {"msg": "User created successfully"}')

with open('backend/server.py', 'w') as f:
    f.write(server)

print("Server.py patched with FCM")
