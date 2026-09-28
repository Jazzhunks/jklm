import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Depends, Request, Response
from core.database import db
from typing import Optional, Dict, Any

_rate_limit_store: dict[str, list[float]] = {}
_failed_login_store: dict[str, list[float]] = {}
_lockout_until: dict[str, float] = {}

def check_rate_limit(key: str, max_requests: int = 30, window_seconds: int = 60):
    now = datetime.now(timezone.utc).timestamp()
    timestamps = [t for t in _rate_limit_store.get(key, []) if now - t < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    timestamps.append(now)
    _rate_limit_store[key] = timestamps

def check_login_lockout(key: str):
    now = datetime.now(timezone.utc).timestamp()
    until = _lockout_until.get(key, 0)
    if now < until:
        remaining = int(until - now)
        raise HTTPException(
            status_code=429,
            detail=f"Account temporarily locked due to repeated failed login attempts. Try again in {remaining} seconds."
        )

def record_failed_login(key: str, max_failures: int = 5, window_seconds: int = 900, lockout_seconds: int = 900):
    now = datetime.now(timezone.utc).timestamp()
    failures = [t for t in _failed_login_store.get(key, []) if now - t < window_seconds]
    failures.append(now)
    _failed_login_store[key] = failures
    if len(failures) >= max_failures:
        _lockout_until[key] = now + lockout_seconds
        _failed_login_store.pop(key, None)

def reset_login_failures(key: str):
    _failed_login_store.pop(key, None)
    _lockout_until.pop(key, None)

def _sanitize_venue(venue: Optional[str]) -> str:
    """Sanitize standard venues or preserve custom school venue names. Merges Srinagar/90FT"""
    if not venue:
        return "90 FT"
    v_clean = venue.strip()
    v_lower = v_clean.lower()
    
    # Merge variations of 90 FT and Srinagar
    if v_lower in ("90 ft", "90ft", "srinagar"):
        return "90 FT"
        
    for allowed in ["Anantnag", "Sopore", "Zakura", "Parraypora"]:
        if allowed.lower() == v_lower:
            return allowed
            
    return v_clean

ALLOWED_SCHOOL_CLASSES = {"ALL","7th Class","8th Class","9th Class","10th Class","11th Class","12th Class"}

def _validate_school_campaign(doc: Dict[str, Any]):
    if doc.get("type") != "school":
        if not doc.get("description"):
            raise HTTPException(400, "description is required for general campaigns")
        if not doc.get("exam_date"):
            raise HTTPException(400, "exam_date is required for general campaigns")
        if not doc.get("deadline"):
            raise HTTPException(400, "deadline is required for general campaigns")
        if not doc.get("eligibility"):
            raise HTTPException(400, "eligibility is required for general campaigns")
        return
    if doc.get("start_date") and doc.get("end_date"):
        if doc["end_date"] < doc["start_date"]:
            raise HTTPException(400, "end_date must be after start_date")
    if doc.get("eligible_classes"):
        invalid = set(doc["eligible_classes"]) - ALLOWED_SCHOOL_CLASSES
        if invalid:
            raise HTTPException(400, f"Invalid eligible_classes: {', '.join(sorted(invalid))}")
    if doc.get("time_slots"):
        for idx, slot in enumerate(doc["time_slots"]):
            if not slot.get("from_time") or not slot.get("to_time"):
                raise HTTPException(400, f"time_slots[{idx}] must have from_time and to_time")

async def _run_maybe_async(func, *args, **kwargs):
    """Run either an async or synchronous client function safely."""
    if inspect.iscoroutinefunction(func):
        return await func(*args, **kwargs)
    return await asyncio.to_thread(func, *args, **kwargs)


def _safe_send_whatsapp_admit_card(*args, **kwargs) -> None:
    """Sync wrapper for FastAPI BackgroundTasks for standard admit cards."""
    try:
        asyncio.run(_run_maybe_async(send_whatsapp_admit_card, *args, **kwargs))
    except Exception as e:
        logging.error(f"Background WhatsApp task failed: {e}")

def _safe_send_whatsapp_wath_carnival(*args, **kwargs) -> None:
    """Sync wrapper for FastAPI BackgroundTasks for WATH Carnival WhatsApp messages."""
    try:
        asyncio.run(_run_maybe_async(send_whatsapp_wath_carnival, *args, **kwargs))
    except Exception as e:
        logging.error(f"Background WATH Carnival WhatsApp task failed: {e}")


async def _send_registration_group_notification(user_doc: dict) -> None:
    """Send a new-registration notification to the configured OpenWA group."""
    openwa_url = os.getenv("OPENWA_URL")
    api_key = os.getenv("OPENWA_API_MASTER_KEY")
    session_id = os.getenv("OPENWA_SESSION_ID")
    group_id = os.getenv("OPENWA_REGISTRATION_GROUP_ID")
    if not all([openwa_url, api_key, session_id, group_id]):
        logging.warning("OpenWA group notification skipped: missing OPENWA_URL/OPENWA_API_MASTER_KEY/OPENWA_SESSION_ID/OPENWA_REGISTRATION_GROUP_ID")
        return

    name = user_doc.get("name", "User")
    email = user_doc.get("email", "")
    phone = user_doc.get("phone", "")
    role = user_doc.get("role", "student")
    text = (
        "🆕 *New Registration*\n\n"
        f"*Name:* {name}\n"
        f"*Email:* {email}\n"
        f"*Phone:* {phone}\n"
        f"*Role:* {role}"
    )
    payload = {
        "chatId": group_id,
        "text": text,
    }
    url = f"{openwa_url.rstrip('/')}/api/sessions/{session_id}/messages/send-text"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload, headers={"X-API-Key": api_key})
            resp.raise_for_status()
            logging.info("Sent registration notification to OpenWA group %s", group_id)
    except Exception as e:
        logging.error("Failed to send registration group notification: %s", e)


async def _send_carnival_booking_notification(booking: dict) -> None:
    """Send a new carnival slot booking notification to the configured OpenWA group and venue contact."""
    openwa_url = os.getenv("OPENWA_URL")
    api_key = os.getenv("OPENWA_API_MASTER_KEY")
    session_id = os.getenv("OPENWA_SESSION_ID")
    group_id = os.getenv("OPENWA_REGISTRATION_GROUP_ID") or os.getenv("OPENWA_CARNIVAL_GROUP_ID")
    if not all([openwa_url, api_key, session_id, group_id]):
        logging.warning("OpenWA carnival notification skipped: missing OPENWA_URL/OPENWA_API_MASTER_KEY/OPENWA_SESSION_ID/OPENWA_REGISTRATION_GROUP_ID")
        return

    text = (
        "🎪 *New Carnival Slot Booking*\n\n"
        f"*Venue:* {booking.get('venue', '—')}\n"
        f"*Name:* {booking.get('name', '—')}\n"
        f"*Mobile Number:* {booking.get('phone', '—')}\n"
        f"*Date:* {booking.get('chosen_date', '—')}\n"
        f"*Time:* {booking.get('chosen_slot_time', '—')}\n"
        f"*Class:* {booking.get('standard', '—')}"
    )
    payload = {
        "chatId": group_id,
        "text": text,
    }
    url = f"{openwa_url.rstrip('/')}/api/sessions/{session_id}/messages/send-text"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload, headers={"X-API-Key": api_key})
            resp.raise_for_status()
            logging.info("Sent carnival booking notification to OpenWA group %s", group_id)
    except Exception as e:
        logging.error("Failed to send carnival booking group notification: %s", e)

    venue = (booking.get("venue") or "").strip().lower()
    venue_contacts_raw = os.getenv("OPENWA_VENUE_CONTACTS", "{}")
    try:
        import json
        venue_contacts = json.loads(venue_contacts_raw)
    except Exception:
        venue_contacts = {}
    venue_contact = venue_contacts.get(venue)
    if not venue_contact:
        return
    venue_chat_id = venue_contact if "@" in venue_contact else f"{venue_contact}@c.us"
    venue_payload = {
        "chatId": venue_chat_id,
        "text": text,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=venue_payload, headers={"X-API-Key": api_key})
            resp.raise_for_status()
            logging.info("Sent carnival booking notification to venue contact %s", venue_chat_id)
    except Exception as e:
        logging.error("Failed to send carnival booking venue notification: %s", e)


async def _send_carnival_daily_summary(force: bool = False) -> None:
    """Send a daily 8 AM summary of today's carnival bookings grouped by venue and class."""
    openwa_url = os.getenv("OPENWA_URL")
    api_key = os.getenv("OPENWA_API_MASTER_KEY")
    session_id = os.getenv("OPENWA_SESSION_ID")
    group_id = os.getenv("OPENWA_REGISTRATION_GROUP_ID") or os.getenv("OPENWA_CARNIVAL_GROUP_ID")
    if not all([openwa_url, api_key, session_id, group_id]):
        logging.warning("OpenWA daily summary skipped: missing OPENWA_URL/OPENWA_API_MASTER_KEY/OPENWA_SESSION_ID/OPENWA_REGISTRATION_GROUP_ID")
        return

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cfg = await db.system_meta.find_one({"key": "wath_page_config"}, {"_id": 0})
    active_carnival_id = (cfg or {}).get("active_carnival_id")
    if not active_carnival_id:
        logging.info("No active carnival configured; skipping daily summary")
        return

    marker_key = f"carnival_daily_summary:{active_carnival_id}:{today}"
    marker = await db.system_meta.find_one({"key": marker_key}, {"_id": 0})
    if not force and marker:
        logging.info("Daily summary already sent for %s; skipping", today)
        return

    cursor = db.scholarship_applications.find(
        {"carnival_id": active_carnival_id, "chosen_date": today},
        {"_id": 0, "venue": 1, "standard": 1, "name": 1, "phone": 1, "chosen_slot_time": 1},
    ).sort("created_at", 1).to_list(1000)

    rows = await cursor
    if not rows:
        logging.info("No carnival bookings for today %s; skipping daily summary", today)
        return

    venues: Dict[str, Any] = {}
    for row in rows:
        venue = (row.get("venue") or "—").strip()
        standard = (row.get("standard") or "—").strip()
        name = (row.get("name") or "—").strip()
        phone = (row.get("phone") or "—").strip()
        time = (row.get("chosen_slot_time") or "—").strip()
        venues.setdefault(venue, {}).setdefault(standard, []).append({
            "name": name,
            "phone": phone,
            "time": time,
        })

    lines = [f"📋 *Today's Slot Bookings* ({today})\n"]
    for venue, classes in venues.items():
        lines.append(f"🏢 *Venue:* {venue}")
        for standard, entries in classes.items():
            if not entries:
                continue
            lines.append(f"\n*Class {standard}*")
            for entry in entries:
                lines.append(f"{entry['name']} -- {entry['phone']} -- {entry['time']}")
        lines.append("")

    text = "\n".join(lines).strip()
    payload = {
        "chatId": group_id,
        "text": text,
    }
    url = f"{openwa_url.rstrip('/')}/api/sessions/{session_id}/messages/send-text"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload, headers={"X-API-Key": api_key})
            resp.raise_for_status()
            await db.system_meta.update_one({"key": marker_key}, {"$set": {"sent_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
            logging.info("Sent carnival daily summary to OpenWA group %s", group_id)
    except Exception as e:
        logging.error("Failed to send carnival daily summary: %s", e)


def _safe_send_carnival_daily_summary(force: bool = False) -> None:
    """Sync wrapper for FastAPI BackgroundTasks for OpenWA daily carnival summary."""
    try:
        asyncio.run(_send_carnival_daily_summary(force=force))
    except Exception as e:
        logging.error("Background OpenWA carnival daily summary failed: %s", e)


def export_excel(rows: list, sheet_name: str, filename: str):
    """Helper utility for generating Excel downloads."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_name
    if rows:
        headers = list(rows[0].keys())
        ws.append(headers)
        for r in rows:
            ws.append([str(r.get(h, "")) for h in headers])
    else:
        ws.append(["No data"])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

JWT_ALGORITHM = "HS256"

def jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET is not configured on the server")
    return secret

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_access_token(uid: str, email: str, role: str) -> str:
    return jwt.encode(
        {"sub": uid, "email": email, "role": role,
         "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
         "type": "access"},
        jwt_secret(), algorithm=JWT_ALGORITHM
    )

def create_refresh_token(uid: str, role: str = "student") -> str:
    ttl = timedelta(days=30) if role == "admin" else timedelta(days=7)
    return jwt.encode(
        {"sub": uid, "exp": datetime.now(timezone.utc) + ttl,
         "type": "refresh"},
        jwt_secret(), algorithm=JWT_ALGORITHM
    )

def set_auth_cookies(response: Response, access: str, refresh: str, refresh_max_age: int = 604800):
    cookie_samesite = os.environ.get("COOKIE_SAMESITE", "none").lower()
    cookie_secure = os.environ.get("COOKIE_SECURE", "true").lower() in ("true", "1", "yes")
    if cookie_samesite == "none":
        cookie_secure = True
    response.set_cookie("access_token", access, httponly=True, secure=cookie_secure, samesite=cookie_samesite, max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=cookie_secure, samesite=cookie_samesite, max_age=refresh_max_age, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "):
            token = ah[7:]
    
    if not token:
        token = request.query_params.get("token")

    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("admin", "super_admin", "super admin", "superadmin", "center_manager", "accountant", "counsellor"):
        raise HTTPException(403, "Admin access required")
    return user

async def require_super_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("admin", "super_admin"):
        raise HTTPException(403, "Super admin access required")
    return user

async def require_school(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "school":
        raise HTTPException(403, "School access required")
    return user

