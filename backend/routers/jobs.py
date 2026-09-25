from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Jobs ----------
@router.get("/jobs")
async def list_jobs():
    return await db.jobs.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(None)

@router.get("/jobs/all")
async def list_all_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    _admin = Depends(require_admin)
):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.jobs.count_documents(query)
    items = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.post("/jobs")
async def create_job(payload: JobIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.jobs.insert_one(doc)
    if doc.get("is_featured"):
        await _clear_featured_except("jobs", doc["id"])
    doc.pop("_id", None)
    return doc

@router.put("/jobs/{jid}")
async def update_job(jid: str, payload: JobIn, _admin = Depends(require_admin)):
    data = payload.model_dump()
    await db.jobs.update_one({"id": jid}, {"$set": data})
    if data.get("is_featured"):
        await _clear_featured_except("jobs", jid)
    return await db.jobs.find_one({"id": jid}, {"_id": 0})

@router.delete("/jobs/{jid}")
async def delete_job(jid: str, _admin = Depends(require_admin)):
    await db.jobs.update_one({"id": jid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

@router.post("/job-applications")
async def apply_job(payload: JobApplicationIn, background: BackgroundTasks):
    job = await db.jobs.find_one({"id": payload.job_id}, {"_id": 0})
    if not job:
        raise HTTPException(404, "Job not found")
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["status"] = "received"
    doc["created_at"] = now_iso()
    await db.job_applications.insert_one(doc)
    doc.pop("_id", None)
    asyncio.create_task(emit_job_application({
        "job_id": payload.job_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "job_title": job["title"],
        "qualification": payload.qualification,
    }))
    background.add_task(email_job_app_received, payload.email, payload.name, job["title"])
    background.add_task(email_admin_notification, f"New job application: {payload.name}",
                       f"<p><b>{payload.name}</b> ({payload.email}, {payload.phone}) applied for <b>{job['title']}</b>.<br/>Qualification: {payload.qualification}<br/>Experience: {payload.experience}<br/>Resume: {payload.resume_url or '—'}</p>")
    return doc

@router.get("/job-applications")
async def list_job_apps(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    _admin = Depends(require_admin)
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"job_id": {"$regex": search, "$options": "i"}},
            {"preferred_location": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.job_applications.count_documents(query)
    items = await db.job_applications.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.put("/job-applications/{aid}/status")
async def update_job_app_status(aid: str, status: str = Query(...), _admin = Depends(require_admin)):
    if status not in ("received", "shortlisted", "rejected", "hired"):
        raise HTTPException(400, "Invalid status")
    await db.job_applications.update_one({"id": aid}, {"$set": {"status": status}})
    return {"ok": True}

