import os
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
use_mock = os.environ.get('USE_MOCK_MONGO', '').strip().lower() in ('1', 'true', 'yes')

if use_mock:
    from mongomock_motor import AsyncMongoMockClient
    client = AsyncMongoMockClient()
    db = client[os.environ.get('DB_NAME', 'northend_db')]
else:
    try:
        client = AsyncIOMotorClient(mongo_url)
        try:
            db = client.get_default_database()
            if db is None:
                raise ValueError("no default database in MONGO_URL")
        except Exception:
            db = client[os.environ.get('DB_NAME', 'northend_db')]
    except Exception:
        from mongomock_motor import AsyncMongoMockClient
        client = AsyncMongoMockClient()
        db = client[os.environ.get('DB_NAME', 'northend_db')]



try:
    import firebase_admin
    from firebase_admin import credentials, messaging
except ImportError:
    firebase_admin = None
    credentials = None
    messaging = None

try:
    cred = credentials.Certificate("northend-admin-app-firebase-adminsdk-fbsvc-79accbd4db.json")
    firebase_admin.initialize_app(cred)
    print("Firebase Admin initialized successfully.")
except Exception as e:
    print(f"Firebase initialization failed: {e}")

from pydantic import BaseModel
class FCMTokenIn(BaseModel):
    token: str


async def send_super_admin_notification(title: str, body: str, target_path: str = ""):
    if messaging is None:
        print("FCM not configured")
        return
    try:
        # Get super_admin AND admin IDs
        admins = await db.users.find({"role": {"$in": ["admin", "super_admin"]}}).to_list(None)
        admin_ids = [a["id"] for a in admins]
        
        tokens = []
        # Get tokens from the new admin_devices collection
        devices = await db.admin_devices.find({"admin_id": {"$in": admin_ids}}).to_list(None)
        tokens.extend([d["push_token"] for d in devices if d.get("push_token")])
        
        # Also fall back to the old fcm_tokens array on user docs just in case
        for admin in admins:
            tokens.extend(admin.get("fcm_tokens", []))
        
        tokens = list(set(tokens))
        if not tokens:
            print("No FCM tokens found to send to")
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



