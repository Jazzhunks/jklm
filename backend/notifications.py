"""Real-time notification system for the Northend admin dashboard."""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

logger = logging.getLogger("notifications")

MAX_NOTIFICATIONS = 100
_notifications: List[Dict[str, Any]] = []
_lock = asyncio.Lock()
_broadcast_queues: List[asyncio.Queue] = []
_broadcast_lock = asyncio.Lock()
_db = None


def set_notifications_db(database):
    global _db
    _db = database


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _emit_and_broadcast(event: Dict[str, Any]) -> None:
    async with _lock:
        _notifications.append(event)
        if len(_notifications) > MAX_NOTIFICATIONS:
            _notifications.pop(0)

    if _db is not None:
        try:
            await _db.admin_notifications.insert_one(dict(event))
        except Exception as e:
            logger.warning(f"Failed to persist notification in DB: {e}")

    async with _broadcast_lock:
        for q in list(_broadcast_queues):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                _broadcast_queues.remove(q)


async def emit_scholarship_application(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "scholarship_application",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_enrollment(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "enrollment",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_job_application(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "job_application",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_whatsapp_message(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "whatsapp_message_received",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_result_published(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "result_published",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_broadcast_complete(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "broadcast_complete",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


# --- ERP Real-Time Notification Emitters ---

async def emit_student_registered(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "student_registered",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_fee_payment(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "fee_payment",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_expense_decision(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "expense_decision",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_lead_created(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "lead_created",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def emit_gst_filed(payload: Dict[str, Any]) -> None:
    await _emit_and_broadcast({
        "id": str(uuid.uuid4()),
        "type": "gst_filed",
        "payload": payload,
        "timestamp": _now_iso(),
        "read": False,
    })


async def mark_read(notification_id: str) -> bool:
    async with _lock:
        for n in _notifications:
            if n["id"] == notification_id:
                n["read"] = True
                break
    if _db is not None:
        try:
            await _db.admin_notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
        except Exception:
            pass
    return True


async def mark_all_read() -> int:
    count = 0
    async with _lock:
        for n in _notifications:
            if not n["read"]:
                n["read"] = True
                count += 1
    if _db is not None:
        try:
            res = await _db.admin_notifications.update_many({"read": False}, {"$set": {"read": True}})
            count = max(count, res.modified_count)
        except Exception:
            pass
    return count


async def list_recent(limit: int = 100) -> List[Dict[str, Any]]:
    if _db is not None:
        try:
            docs = await _db.admin_notifications.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
            if docs:
                return docs
        except Exception as e:
            logger.warning(f"Failed to fetch notifications from DB: {e}")
    async with _lock:
        return list(reversed(_notifications[-limit:]))


def build_notifications_router(require_admin_dep, db=None) -> APIRouter:
    if db is not None:
        set_notifications_db(db)
    router = APIRouter()

    @router.get("/admin/notifications")
    async def get_notifications(_admin=Depends(require_admin_dep)):
        return await list_recent()

    @router.post("/admin/notifications/{notification_id}/read")
    async def mark_single_read(notification_id: str, _admin=Depends(require_admin_dep)):
        ok = await mark_read(notification_id)
        if not ok:
            raise HTTPException(404, "Notification not found")
        return {"ok": True}

    @router.post("/admin/notifications/read-all")
    async def mark_all_as_read(_admin=Depends(require_admin_dep)):
        count = await mark_all_read()
        return {"ok": True, "marked": count}

    @router.get("/admin/notifications/stream")
    async def stream_notifications(request: Request, _admin=Depends(require_admin_dep)):
        async def event_generator():
            client_queue: asyncio.Queue = asyncio.Queue(maxsize=100)
            async with _broadcast_lock:
                _broadcast_queues.append(client_queue)
            try:
                yield 'retry: 5000\ndata: {"type": "system_handshake", "system_status": "CONNECTED_STREAM_SYNC_OK"}\n\n'
                while True:
                    if await request.is_disconnected():
                        break
                    try:
                        event = await asyncio.wait_for(client_queue.get(), timeout=1.0)
                        payload_str = json.dumps(event)
                        # Emit both named event and default message for 100% universal compatibility
                        yield f"event: notification_received\ndata: {payload_str}\n\n"
                        yield f"data: {payload_str}\n\n"
                    except asyncio.TimeoutError:
                        yield ": keep-alive\n\n"
            except asyncio.CancelledError:
                pass
            finally:
                async with _broadcast_lock:
                    if client_queue in _broadcast_queues:
                        _broadcast_queues.remove(client_queue)

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    return router
