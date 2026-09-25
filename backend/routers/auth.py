from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Auth Routes ----------
def _safe_send_registration_group_notification(user_doc: dict) -> None:
    """Sync wrapper for FastAPI BackgroundTasks for OpenWA registration group notifications."""
    try:
        asyncio.run(_send_registration_group_notification(user_doc))
    except Exception as e:
        logging.error("Background OpenWA registration notification failed: %s", e)


def _safe_send_carnival_booking_notification(booking: dict) -> None:
    """Sync wrapper for FastAPI BackgroundTasks for OpenWA carnival booking group notifications."""
    try:
        asyncio.run(_send_carnival_booking_notification(booking))
    except Exception as e:
        logging.error("Background OpenWA carnival booking notification failed: %s", e)


@router.post("/auth/register")
async def register(payload: RegisterIn, response: Response, background: BackgroundTasks):
    email = payload.email.lower().strip()
    if len(email) > 254 or len(payload.password) > 128:
        raise HTTPException(400, "Invalid payload length")

    if payload.phone and not re.fullmatch(r"\d{10}", payload.phone.strip()):
        raise HTTPException(400, "Mobile number must be exactly 10 digits")

    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    if payload.phone and await db.users.find_one({"phone": payload.phone.strip()}):
        raise HTTPException(400, "Phone number already registered")
        
    if payload.phone:
        otp_record = await db.otps.find_one({"phone": payload.phone.strip(), "action": "register", "verified": True})
        if not otp_record:
            raise HTTPException(400, "Phone number not verified via OTP")
        await db.otps.delete_one({"_id": otp_record["_id"]})

    user_id = new_id()
    role = "school" if payload.school_name else "student"
    doc = {
        "id": user_id, "name": payload.name, "email": email,
        "phone": payload.phone, "role": role,
        "password_hash": hash_password(payload.password),
        "created_at": now_iso(),
    }
    if role == "school":
        doc.update({
            "school_name": payload.school_name,
            "address": payload.address,
            "district": payload.district,
            "school_type": payload.school_type,
        })
    await db.users.insert_one(doc)
    access = create_access_token(user_id, email, role)
    refresh = create_refresh_token(user_id, role)
    refresh_ttl = 2592000 if role == "admin" else 604800
    set_auth_cookies(response, access, refresh, refresh_max_age=refresh_ttl)
    doc.pop("password_hash")
    doc.pop("_id", None)
    background.add_task(_safe_send_registration_group_notification, doc)
    
    background.add_task(
        send_super_admin_notification, 
        title="New Student Registration 🎓", 
        body=f"{payload.name} ({payload.phone or email}) just registered.", 
        target_path="/admin/students"
    )
    
    return {"user": doc, "access_token": access}
    
    return {"user": doc, "access_token": access}


@router.post("/auth/test-whatsapp")
async def test_whatsapp(payload: dict):
    phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
    access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN")
    async with httpx.AsyncClient() as client:
        msg_url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
        headers = {"Authorization": f"Bearer {access_token}"}
        res = await client.post(msg_url, json=payload, headers=headers)
        return {"status": res.status_code, "text": res.text}


@router.get("/auth/debug-otp/{phone}")
async def debug_otp(phone: str):
    record = await db.otps.find_one({"phone": phone})
    if record:
        return {"code": record["code"], "expires_at": str(record["expires_at"])}
    return {"error": "Not found"}

@router.get("/auth/ping")
async def ping():
    return {"status": "pong_v2"}

@router.post("/auth/send-otp")
async def send_otp(payload: SendOtpIn):
    phone = payload.phone.strip() if payload.phone else None
    email = payload.email.strip().lower() if payload.email else None

    if phone:
        if not re.fullmatch(r"\d{10}", phone):
            raise HTTPException(400, "Mobile number must be exactly 10 digits")
    elif email:
        user = await db.users.find_one({"$or": [{"email": email}, {"phone": email}]})
        if not user:
            raise HTTPException(404, "No account found with this email")
        phone = user.get("phone", "")
        if not phone or not re.fullmatch(r"\d{10}", str(phone).strip()):
            raise HTTPException(400, "No mobile number registered with this account")
        phone = str(phone).strip()
    else:
        raise HTTPException(400, "Provide either mobile number or email")

    user = await db.users.find_one({"phone": phone})
    if payload.action in ("login", "forgot") and not user:
        raise HTTPException(404, "Phone number not registered")
    if payload.action in ("register", "update_phone") and user:
        raise HTTPException(400, "Phone number already registered to another account")
    
    existing = await db.otps.find_one({"phone": phone, "action": payload.action})
    if existing and existing["expires_at"] > datetime.utcnow():
        code = existing["code"]
        expires_at = existing["expires_at"]
    else:
        code = f"{100000 + __import__('secrets').randbelow(900000)}"
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        await db.otps.update_one(
            {"phone": phone, "action": payload.action},
            {"$set": {"code": code, "expires_at": expires_at, "attempts": 0}},
            upsert=True
        )
    
    success, err_msg = await send_whatsapp_otp(phone, code)
    if not success:
        raise HTTPException(500, f"WhatsApp Delivery Failed: {err_msg}")
    return {"ok": True, "message": "OTP sent via WhatsApp", "phone": phone}

@router.post("/auth/verify-otp")
async def verify_otp(payload: VerifyOtpIn, response: Response):
    phone = payload.phone.strip()
    if not re.fullmatch(r"\d{10}", phone):
        raise HTTPException(400, "Mobile number must be exactly 10 digits")
    record = await db.otps.find_one({"phone": phone, "action": payload.action})
    
    if not record:
        raise HTTPException(400, "OTP not found for this number/action")
        
    attempts = record.get("attempts", 0)
    if attempts >= 5:
        await db.otps.delete_one({"_id": record["_id"]})
        raise HTTPException(429, "Too many failed attempts. Please request a new OTP.")
        
    if record["code"] != payload.code:
        await db.otps.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, "Incorrect OTP. Please try again.")
        
    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "OTP has expired")
        
    if payload.action == "login":
        try:
            user = await db.users.find_one({"phone": phone})
            if not user: raise HTTPException(404, "User not found")
            await db.otps.delete_one({"_id": record["_id"]})
            role = user.get("role", "student")
            access = create_access_token(user["id"], user.get("email", ""), role)
            refresh = create_refresh_token(user["id"], role)
            refresh_ttl = 2592000 if role == "admin" else 604800
            set_auth_cookies(response, access, refresh, refresh_max_age=refresh_ttl)
            doc = dict(user); doc.pop("_id", None); doc.pop("password_hash", None)
            return {"user": doc, "access_token": access, "refresh_token": refresh}
        except Exception as e:
            raise HTTPException(500, f"Login processing failed: {repr(e)}")
        
    elif payload.action == "register":
        await db.otps.update_one({"_id": record["_id"]}, {"$set": {"verified": True}})
        return {"ok": True}
        
    return {"ok": True}

@router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordIn):
    phone = payload.phone.strip()
    if not re.fullmatch(r"\d{10}", phone):
        raise HTTPException(400, "Mobile number must be exactly 10 digits")
    record = await db.otps.find_one({"phone": phone, "action": "forgot"})
    
    if not record:
        raise HTTPException(400, "OTP not found for this number/action")
        
    attempts = record.get("attempts", 0)
    if attempts >= 5:
        await db.otps.delete_one({"_id": record["_id"]})
        raise HTTPException(429, "Too many failed attempts. Please request a new OTP.")
        
    if record["code"] != payload.code:
        await db.otps.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, "Incorrect OTP. Please try again.")
        
    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "OTP has expired")
        
    user = await db.users.find_one({"phone": phone})
    if not user: raise HTTPException(404, "User not found")
    
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    await db.otps.delete_one({"_id": record["_id"]})
    return {"ok": True, "message": "Password updated successfully"}

@router.post("/auth/login")
@router.post("/login")
async def login(payload: LoginIn, request: Request, response: Response):
    email = payload.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown"
    lockout_key = f"{email}:{client_ip}"
    check_login_lockout(lockout_key)

    if len(email) > 254 or len(payload.password) > 128:
        record_failed_login(lockout_key)
        raise HTTPException(401, "Invalid email or password")

    user = await db.users.find_one({"$or": [{"email": email}, {"phone": email}]})
    dummy_hash = "$2b$12$UnV2ZWRuZWVkTG9naW5IYXJkZW5lZFNlY3VyaXR5R29vZA=="
    target_hash = user["password_hash"] if user else dummy_hash
    password_correct = verify_password(payload.password, target_hash)

    if not user or not password_correct:
        record_failed_login(lockout_key)
        raise HTTPException(401, "Invalid email or password")
        
    reset_login_failures(lockout_key)
    access = create_access_token(user["id"], email, user["role"])
    refresh = create_refresh_token(user["id"], user["role"])
    refresh_ttl = 2592000 if user["role"] == "admin" else 604800
    set_auth_cookies(response, access, refresh, refresh_max_age=refresh_ttl)
    user.pop("password_hash")
    user.pop("_id", None)
    return {"user": user, "access_token": access, "refresh_token": refresh}

@router.get("/login")
@router.get("/login")
async def login_page():
    return {"message": "Northend authentication endpoint. Please POST credentials to authenticate."}


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    receipt_print_size: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    otp_code: Optional[str] = None

@router.patch("/auth/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    patch = payload.model_dump(exclude_unset=True)
    
    # If phone is being updated, we MUST verify the OTP sent to that NEW phone
    if "phone" in patch and patch["phone"] != user.get("phone"):
        new_phone = patch["phone"]
        code = patch.pop("otp_code", None)
        if not code:
            raise HTTPException(400, "otp_code is required when changing phone number")
        
        # Verify OTP
        record = await db.otps.find_one({"phone": new_phone, "action": "update_phone"})
        if not record or record["code"] != code or record["expires_at"] < datetime.utcnow():
            raise HTTPException(400, "Invalid or expired OTP for new phone number")
            
        # Clean OTP
        await db.otps.delete_one({"_id": record["_id"]})
        
        # Check if phone is already taken by another user
        existing = await db.users.find_one({"phone": new_phone})
        if existing and existing["id"] != user["id"]:
            raise HTTPException(400, "Phone number is already registered to another account")

    if "password" in patch:
        patch["password_hash"] = hash_password(patch.pop("password"))
    
    # Remove otp_code from patch if it wasn't popped
    patch.pop("otp_code", None)

    if not patch:
        return {"user": user}
    
    await db.users.update_one({"id": user["id"]}, {"$set": patch})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}

@router.post("/auth/logout")
@router.post("/logout")
async def logout(response: Response):
    cookie_samesite = os.environ.get("COOKIE_SAMESITE", "none").lower()
    cookie_secure = os.environ.get("COOKIE_SECURE", "true").lower() in ("true", "1", "yes")
    if cookie_samesite == "none":
        cookie_secure = True
    response.set_cookie("access_token", "", httponly=True, secure=cookie_secure, samesite=cookie_samesite, max_age=0, path="/")
    response.set_cookie("refresh_token", "", httponly=True, secure=cookie_secure, samesite=cookie_samesite, max_age=0, path="/")
    return {"ok": True}

@router.get("/auth/me")
@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        try:
            body = await request.json()
            if isinstance(body, dict):
                refresh_token = body.get("refresh_token")
        except Exception:
            pass
    if not refresh_token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "):
            refresh_token = ah[7:]
    if not refresh_token:
        raise HTTPException(401, "Missing refresh token")
    try:
        payload = jwt.decode(refresh_token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        access = create_access_token(user["id"], user["email"], user["role"])
        refresh = create_refresh_token(user["id"], user["role"])
        refresh_ttl = 2592000 if user["role"] == "admin" else 604800
        set_auth_cookies(response, access, refresh, refresh_max_age=refresh_ttl)
        return {"access_token": access, "refresh_token": refresh, "user": user}
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")

