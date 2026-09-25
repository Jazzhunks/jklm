with open("backend/server.py", "r") as f:
    text = f.read()

old_func = """@api.post("/admin/push-notifications")
async def send_push_notification(payload: PushNotificationIn, _admin = Depends(require_admin)):
    target_map = {
        "all": None,
        "admin": [{"field": "tag", "key": "role", "value": "admin"}],
        "student": [{"field": "tag", "key": "role", "value": "student"}],
    }
    result = await send_onesignal_notification(
        headings={"en": payload.title},
        contents={"en": payload.message},
        filters=target_map.get(payload.target),
        data={"source": "admin_dashboard"},
        url=payload.url,
        image=payload.image,
        name="admin_push_" + uuid.uuid4().hex[:8],
    )
    return {"ok": True, "result": result}"""

new_func = """@api.post("/admin/push-notifications")
async def send_push_notification(payload: PushNotificationIn, _admin = Depends(require_admin)):
    # Legacy OneSignal fallback removed - replacing with new Firebase FCM
    # Currently only admin targeting is supported natively via FCM
    await send_super_admin_notification(
        title=payload.title,
        body=payload.message,
        target_path=payload.url or ""
    )
    return {"ok": True, "result": "Sent via Firebase FCM"}"""

text = text.replace(old_func, new_func)

with open("backend/server.py", "w") as f:
    f.write(text)
