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

import inspect, asyncio, logging, httpx

def _safe_sync(f, *a, **k):
    try: asyncio.run((f(*a, **k) if inspect.iscoroutinefunction(f) else asyncio.to_thread(f, *a, **k)))
    except Exception: pass

_safe_send_whatsapp_admit_card = lambda *a, **k: _safe_sync(send_whatsapp_admit_card, *a, **k)
_safe_send_whatsapp_wath_carnival = lambda *a, **k: _safe_sync(send_whatsapp_wath_carnival, *a, **k)



async def _send_openwa(gid, text, extra=None):
    u, k, s = (os.getenv(x) for x in ("OPENWA_URL", "OPENWA_API_MASTER_KEY", "OPENWA_SESSION_ID"))
    if not all([u, k, s, gid]): return
    api = f"{u.rstrip('/')}/api/sessions/{s}/messages/send-text"
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            await c.post(api, json={"chatId": gid, "text": text}, headers={"X-API-Key": k})
            if extra: await c.post(api, json={"chatId": extra, "text": text}, headers={"X-API-Key": k})
    except Exception: pass

async def _send_registration_group_notification(doc: dict):
    await _send_openwa(os.getenv("OPENWA_REGISTRATION_GROUP_ID"), f"🆕 *New Registration*\n\n*Name:* {doc.get('name', 'User')}\n*Email:* {doc.get('email', '')}\n*Phone:* {doc.get('phone', '')}\n*Role:* {doc.get('role', 'student')}")

async def _send_carnival_booking_notification(b: dict):
    v = (b.get("venue") or "").strip().lower()
    c = __import__('json').loads(os.getenv("OPENWA_VENUE_CONTACTS", "{}")).get(v)
    extra = (c if "@" in c else f"{c}@c.us") if c else None
    await _send_openwa(os.getenv("OPENWA_REGISTRATION_GROUP_ID") or os.getenv("OPENWA_CARNIVAL_GROUP_ID"), f"🎪 *New Carnival Slot Booking*\n\n*Venue:* {b.get('venue', '—')}\n*Name:* {b.get('name', '—')}\n*Mobile Number:* {b.get('phone', '—')}\n*Date:* {b.get('chosen_date', '—')}\n*Time:* {b.get('chosen_slot_time', '—')}\n*Class:* {b.get('standard', '—')}", extra)

async def _send_carnival_daily_summary(force: bool = False):
    gid = os.getenv("OPENWA_REGISTRATION_GROUP_ID") or os.getenv("OPENWA_CARNIVAL_GROUP_ID")
    if not gid: return
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cfg = await db.system_meta.find_one({"key": "wath_page_config"}, {"_id": 0})
    cid = (cfg or {}).get("active_carnival_id")
    if not cid: return
    mkey = f"carnival_daily_summary:{cid}:{today}"
    if not force and await db.system_meta.find_one({"key": mkey}, {"_id": 0}): return
    rows = await db.scholarship_applications.find({"carnival_id": cid, "chosen_date": today}, {"_id": 0, "venue": 1, "standard": 1, "name": 1, "phone": 1, "chosen_slot_time": 1}).to_list(1000)
    if not rows: return
    v_dict = {}
    for r in rows:
        v_dict.setdefault((r.get("venue") or "—").strip(), {}).setdefault((r.get("standard") or "—").strip(), []).append(f"{r.get('name', '—')} -- {r.get('phone', '—')} -- {r.get('chosen_slot_time', '—')}")
    lines = [f"📋 *Today's Slot Bookings* ({today})\n"]
    for v, classes in v_dict.items():
        lines.append(f"🏢 *Venue:* {v}")
        for s, entries in classes.items():
            lines.append(f"\n*Class {s}*\n" + "\n".join(entries))
        lines.append("")
    await _send_openwa(gid, "\n".join(lines).strip())
    await db.system_meta.update_one({"key": mkey}, {"$set": {"sent_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)

_safe_send_carnival_daily_summary = lambda f=False: _safe_sync(_send_carnival_daily_summary, f)



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

def jwt_secret():
    if not (s := os.getenv("JWT_SECRET")): raise RuntimeError("No JWT_SECRET")
    return s

hash_password = lambda p: bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
verify_password = lambda p, h: bcrypt.checkpw(p.encode(), h.encode())

def create_access_token(uid: str, email: str, role: str) -> str:
    return jwt.encode({"sub": uid, "email": email, "role": role, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}, jwt_secret(), algorithm="HS256")

def create_refresh_token(uid: str, role: str = "student") -> str:
    return jwt.encode({"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=30 if role == "admin" else 7), "type": "refresh"}, jwt_secret(), algorithm="HS256")

def set_auth_cookies(response: Response, access: str, refresh: str, refresh_max_age: int = 604800):
    cs = os.environ.get("COOKIE_SAMESITE", "none").lower()
    sec = True if cs == "none" else os.environ.get("COOKIE_SECURE", "true").lower() in ("true", "1", "yes")
    for k, v, a in [("access_token", access, 3600), ("refresh_token", refresh, refresh_max_age)]:
        response.set_cookie(k, v, httponly=True, secure=sec, samesite=cs, max_age=a, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token") or (request.headers.get("Authorization", "")[7:] if request.headers.get("Authorization", "").startswith("Bearer ") else request.query_params.get("token"))
    if not token: raise HTTPException(401, "Not authenticated")
    try:
        p = jwt.decode(token, jwt_secret(), algorithms=["HS256"])
        if p.get("type") != "access": raise HTTPException(401, "Invalid token type")
        if not (u := await db.users.find_one({"id": p["sub"]}, {"_id": 0, "password_hash": 0})): raise HTTPException(401, "User not found")
        return u
    except Exception as e: raise HTTPException(401, str(e))

def _req_role(roles):
    async def _check(u: dict = Depends(get_current_user)):
        if u.get("role") not in roles: raise HTTPException(403, "Access denied")
        return u
    return _check

require_admin = _req_role(("admin", "super_admin", "super admin", "superadmin", "center_manager", "accountant", "counsellor"))
require_super_admin = _req_role(("admin", "super_admin"))
require_school = _req_role(("school",))

