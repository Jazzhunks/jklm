import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

db_name = os.environ.get('DB_NAME', 'northend_db')
if os.environ.get('USE_MOCK_MONGO', '').strip().lower() in ('1', 'true', 'yes'):
    from mongomock_motor import AsyncMongoMockClient
    client = AsyncMongoMockClient()
    db = client[db_name]
else:
    try:
        client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
        try: db = client.get_default_database()
        except Exception: db = client[db_name]
    except Exception:
        from mongomock_motor import AsyncMongoMockClient
        client, db = AsyncMongoMockClient(), client[db_name]

try:
    from firebase_admin import credentials, messaging, initialize_app
    initialize_app(credentials.Certificate("northend-admin-app-firebase-adminsdk-fbsvc-79accbd4db.json"))
except Exception:
    messaging = None

class FCMTokenIn(BaseModel):
    token: str

async def send_super_admin_notification(title: str, body: str, target_path: str = ""):
    if not messaging: return
    try:
        admins = await db.users.find({"role": {"$in": ["admin", "super_admin"]}}).to_list(None)
        devices = await db.admin_devices.find({"admin_id": {"$in": [a["id"] for a in admins]}}).to_list(None)
        
        tokens = {d["push_token"] for d in devices if d.get("push_token")}
        for a in admins: tokens.update(a.get("fcm_tokens", []))
        
        if tokens:
            messaging.send_multicast(messaging.MulticastMessage(
                notification=messaging.Notification(title=title, body=body),
                data={"target_path": target_path},
                tokens=list(tokens)
            ))
    except Exception: pass
