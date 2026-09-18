import re

with open("backend/notifications.py", "r") as f:
    text = f.read()

# Add AdminDeviceIn class near the top
class_definition = """
class AdminDeviceIn(BaseModel):
    device_id: str
    platform: str
    user_agent: str
    notification_enabled: bool

"""

# find APIRouter instantiation
import_idx = text.find('router = APIRouter')

if "class AdminDeviceIn" not in text:
    text = text[:import_idx] + "from pydantic import BaseModel\n\n" + class_definition + text[import_idx:]


route_definition = """
@router.post("/admin/devices")
async def register_admin_device(payload: AdminDeviceIn):
    if not _db:
        return {"ok": False}
    doc = payload.dict()
    doc["updated_at"] = _now_iso()
    await _db.admin_devices.update_one(
        {"device_id": payload.device_id},
        {"$set": doc},
        upsert=True
    )
    return {"ok": True}
"""

if "/admin/devices" not in text:
    text = text + "\n" + route_definition

with open("backend/notifications.py", "w") as f:
    f.write(text)

