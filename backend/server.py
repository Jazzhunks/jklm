# 1. LOAD ENVIRONMENT VARIABLES FIRST
import os

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# NVIDIA API Configuration dynamically loaded from environment
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")

# 2. STANDARD LIBRARY IMPORTS
import logging
import asyncio
import inspect
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Dict, Any

# 3. EXTERNAL DEPENDENCIES
from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Depends, Request, Response, Query, Form
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# 4. INTERNAL CLIENTS (Loaded after environment is populated)
from storage_client import init_storage, put_object, get_object, aclose as storage_aclose, APP_NAME

from notifications import (
    build_notifications_router,
    emit_scholarship_application,
    emit_enrollment,
    emit_job_application,
    emit_whatsapp_message,
    emit_result_published,
    emit_broadcast_complete,
)
from onesignal_client import notify_admins, notify_students, send_onesignal_notification


from models.schemas import unique_slug
from routers import auth, courses, scholarships, enrollments, jobs, schools, attendance, content, whatsapp
from core.database import db, client
from core.security import *
from core.utils import *
from core.seed import _run_initial_seed as seed

app = FastAPI(title="Unacademy Offline Centre API")
# ---------- App wiring ----------
from erp_routes import build_erp_router, erp_seed
erp_router = build_erp_router(db, get_current_user, hash_password, verify_password, require_admin)
app.include_router(erp_router)

from whatsapp_inbox import build_whatsapp_router
async def _on_whatsapp_inbound(payload: Dict[str, Any]) -> None:
    await emit_whatsapp_message(payload)
    asyncio.create_task(notify_admins(
        "New WhatsApp Message",
        payload.get("name") or payload.get("from_number", "Unknown"),
        data={"type": "whatsapp_message", "message_id": payload.get("message_id")},
        url="/admin",
    ))

app.include_router(build_whatsapp_router(db, require_super_admin, on_inbound=_on_whatsapp_inbound))
# WATH Carnival + page config
notifications_router = build_notifications_router(require_admin, db=db)
app.include_router(notifications_router)
from wath_carnival import build_wath_router, try_reserve_slot, release_slot  # noqa: E402
app.include_router(build_wath_router(db, require_admin))

# ============================================================================
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"status": "ok", "service": "Unacademy Offline Centre API"}

async def _safe(f, *a):
    try: await f(*a)
    except Exception as e: logging.error(f"{f.__name__}() failed: {e}")

async def _run_boot_tasks():
    for f, a in [(seed, ()), (erp_seed, (db, hash_password)), (init_storage, ()), (_backfill_slugs, ())]: await _safe(f, *a)
    logging.info("Unacademy Offline Centre backend ready.")


async def _backfill_slugs():
    for c, k in [("courses", "title"), ("scholarships", "title"), ("centers", "name"), ("wath_carnivals", "title")]:
        async for doc in db[c].find({"$or": [{"slug": {"$exists": False}}, {"slug": None}, {"slug": ""}]}, {"id": 1, "title": 1, "name": 1}):
            await db[c].update_one({"id": doc["id"]}, {"$set": {"slug": await unique_slug(c, doc.get(k) or doc.get("name") or doc.get("title") or "item", exclude_id=doc.get("id"))}})


async def _schedule_daily_summary():
    """Send carnival daily booking summary at 8:00 AM server time, with catch-up for missed days."""
    while True:
        now = datetime.now(timezone.utc)
        today = now.strftime("%Y-%m-%d")
        target = now.replace(hour=8, minute=0, second=0, microsecond=0)
        missed_today = False
        if now >= target:
            cfg = await db.system_meta.find_one({"key": "wath_page_config"}, {"_id": 0})
            active_carnival_id = (cfg or {}).get("active_carnival_id")
            if active_carnival_id:
                marker_key = f"carnival_daily_summary:{active_carnival_id}:{today}"
                marker = await db.system_meta.find_one({"key": marker_key}, {"_id": 0})
                if not marker:
                    missed_today = True
            target = target + timedelta(days=1)
        try:
            await asyncio.sleep(max(0, (target - now).total_seconds()))
        except Exception:
            return
        if missed_today:
            try:
                await _send_carnival_daily_summary(force=True)
            except Exception as e:
                logging.error("Catch-up daily carnival summary send failed: %s", e)
        try:
            await _send_carnival_daily_summary()
        except Exception as e:
            logging.error("Daily carnival summary task failed: %s", e)
        try:
            await asyncio.sleep(24 * 60 * 60)
        except Exception:
            return

@app.on_event("startup")
async def on_start():
    asyncio.create_task(_run_boot_tasks())
    asyncio.create_task(_schedule_daily_summary())

@app.on_event("shutdown")
async def on_stop():
    await storage_aclose()
    client.close()
# Mount standard routers
app.include_router(auth.router, prefix='/api')
app.include_router(courses.router, prefix='/api')
app.include_router(scholarships.router, prefix='/api')
app.include_router(enrollments.router, prefix='/api')
app.include_router(jobs.router, prefix='/api')
app.include_router(schools.router, prefix='/api')
app.include_router(attendance.router, prefix='/api')
app.include_router(content.router, prefix='/api')
app.include_router(whatsapp.router, prefix='/api')
