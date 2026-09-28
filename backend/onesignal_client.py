import os, httpx, logging

logger = logging.getLogger("onesignal")
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID", "41952295-559a-4ac1-9431-36443a3195ee")
ONESIGNAL_API_KEY = os.getenv("ONESIGNAL_API_KEY")

async def send_onesignal_notification(headings, contents, **kwargs):
    if not ONESIGNAL_API_KEY: return {"skipped": True}
    payload = {"app_id": ONESIGNAL_APP_ID, "headings": headings, "contents": contents, "priority": 10, **{k:v for k,v in kwargs.items() if v is not None}}
    if "image" in payload: payload["chrome_web_image"] = payload.pop("image")
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post("https://api.onesignal.com/notifications", json=payload, headers={"Authorization": f"Basic {ONESIGNAL_API_KEY}"})
            r.raise_for_status()
            return r.json()
    except Exception as e:
        return {"error": str(e)}

async def notify_admins(title, message, **kw):
    return await send_onesignal_notification({"en": title}, {"en": message}, filters=[{"field": "tag", "key": "role", "value": "admin"}], url=kw.get("url", "/admin"), data=kw.get("data", {}))

async def notify_students(title, message, **kw):
    return await send_onesignal_notification({"en": title}, {"en": message}, filters=[{"field": "tag", "key": "role", "value": "student"}], url=kw.get("url", "/"), data=kw.get("data", {}))
