import re

with open("backend/notifications.py", "r") as f:
    text = f.read()

# Restore the function definition block correctly
text = text.replace("""    from pydantic import BaseModel


class AdminDeviceIn(BaseModel):
    device_id: str
    platform: str
    user_agent: str
    notification_enabled: bool

router = APIRouter()""", """    router = APIRouter()""")

# Place the class definition at the top of the file
if "class AdminDeviceIn" not in text:
    top_imports = "from pydantic import BaseModel\n\nclass AdminDeviceIn(BaseModel):\n    device_id: str\n    platform: str\n    user_agent: str\n    notification_enabled: bool\n\n"
    text = text.replace('from pydantic import BaseModel\n', '')
    text = text.replace('from typing import Any, Dict, List, Optional\n', 'from typing import Any, Dict, List, Optional\n' + top_imports)

# Remove the incorrectly placed route at the very end
bad_route = """@router.post("/admin/devices")
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
text = text.replace(bad_route, "")

# Insert the new route inside the build_notifications_router function, before return router
new_route_indented = """
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

if "register_admin_device" not in text:
    text = text.replace("    return router\n", new_route_indented + "    return router\n")

with open("backend/notifications.py", "w") as f:
    f.write(text)

