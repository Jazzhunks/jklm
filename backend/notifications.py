import asyncio, json, logging, uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

class AdminDeviceIn(BaseModel):
    device_id: str; platform: str; user_agent: str; notification_enabled: bool

logger = logging.getLogger("notifications")
MAX_NOTIFICATIONS = 100
_notifications, _lock = [], asyncio.Lock()
_broadcast_queues, _broadcast_lock = [], asyncio.Lock()
_db = None

def set_notifications_db(db): global _db; _db = db

async def _emit_and_broadcast(type_str: str, payload: Dict[str, Any]):
    event = {"id": str(uuid.uuid4()), "type": type_str, "payload": payload, "timestamp": datetime.now(timezone.utc).isoformat(), "read": False}
    async with _lock:
        _notifications.append(event)
        if len(_notifications) > MAX_NOTIFICATIONS: _notifications.pop(0)
    if _db is not None:
        try: await _db.admin_notifications.insert_one(dict(event))
        except Exception as e: logger.warning(f"DB insert failed: {e}")
    async with _broadcast_lock:
        for q in list(_broadcast_queues):
            try: q.put_nowait(event)
            except asyncio.QueueFull: _broadcast_queues.remove(q)

async def emit_scholarship_application(p: dict): await _emit_and_broadcast("scholarship_application", p)
async def emit_enrollment(p: dict): await _emit_and_broadcast("enrollment", p)
async def emit_job_application(p: dict): await _emit_and_broadcast("job_application", p)
async def emit_whatsapp_message(p: dict): await _emit_and_broadcast("whatsapp_message_received", p)
async def emit_result_published(p: dict): await _emit_and_broadcast("result_published", p)
async def emit_broadcast_complete(p: dict): await _emit_and_broadcast("broadcast_complete", p)
async def emit_student_registered(p: dict): await _emit_and_broadcast("student_registered", p)
async def emit_fee_payment(p: dict): await _emit_and_broadcast("fee_payment", p)
async def emit_expense_decision(p: dict): await _emit_and_broadcast("expense_decision", p)
async def emit_lead_created(p: dict): await _emit_and_broadcast("lead_created", p)
async def emit_gst_filed(p: dict): await _emit_and_broadcast("gst_filed", p)

async def mark_read(notif_id: str) -> bool:
    async with _lock:
        for n in _notifications:
            if n["id"] == notif_id: n["read"] = True; break
    if _db is not None:
        try: await _db.admin_notifications.update_one({"id": notif_id}, {"$set": {"read": True}})
        except Exception: pass
    return True

async def mark_all_read() -> int:
    count = 0
    async with _lock:
        for n in _notifications:
            if not n["read"]: n["read"] = True; count += 1
    if _db is not None:
        try:
            res = await _db.admin_notifications.update_many({"read": False}, {"$set": {"read": True}})
            count = max(count, res.modified_count)
        except Exception: pass
    return count

async def list_recent(limit: int = 100) -> List[Dict[str, Any]]:
    if _db is not None:
        try:
            if docs := await _db.admin_notifications.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit): return docs
        except Exception: pass
    async with _lock: return list(reversed(_notifications[-limit:]))

def build_notifications_router(require_admin_dep, db=None) -> APIRouter:
    if db is not None: set_notifications_db(db)
    router = APIRouter()

    @router.get("/admin/notifications")
    async def get_notifications(_=Depends(require_admin_dep)): return await list_recent()

    @router.post("/admin/notifications/{notif_id}/read")
    async def mark_single_read(notif_id: str, _=Depends(require_admin_dep)):
        if not await mark_read(notif_id): raise HTTPException(404, "Not found")
        return {"ok": True}

    @router.post("/admin/notifications/read-all")
    async def mark_all_as_read(_=Depends(require_admin_dep)):
        return {"ok": True, "marked": await mark_all_read()}

    @router.get("/admin/notifications/stream")
    async def stream_notifications(request: Request, _=Depends(require_admin_dep)):
        async def event_generator():
            q = asyncio.Queue(maxsize=100)
            async with _broadcast_lock: _broadcast_queues.append(q)
            try:
                yield 'retry: 5000\ndata: {"type": "system_handshake", "system_status": "CONNECTED_STREAM_SYNC_OK"}\n\n'
                while not await request.is_disconnected():
                    try:
                        event = await asyncio.wait_for(q.get(), timeout=1.0)
                        p_str = json.dumps(event)
                        yield f"event: notification_received\ndata: {p_str}\n\ndata: {p_str}\n\n"
                    except asyncio.TimeoutError: yield ": keep-alive\n\n"
            finally:
                async with _broadcast_lock:
                    if q in _broadcast_queues: _broadcast_queues.remove(q)
        return StreamingResponse(event_generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"})

    @router.post("/admin/devices")
    async def register_admin_device(payload: AdminDeviceIn):
        if not _db: return {"ok": False}
        doc = payload.dict(); doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        await _db.admin_devices.update_one({"device_id": payload.device_id}, {"$set": doc}, upsert=True)
        return {"ok": True}

    return router
