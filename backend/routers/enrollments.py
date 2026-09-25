from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Enrollments ----------
@router.post("/enrollments")
async def create_enrollment(payload: EnrollmentIn, request: Request, background: BackgroundTasks):
    course = await db.courses.find_one({"id": payload.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(404, "Course not found")
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["course_title"] = course.get("title") or course.get("name") or ""
    doc["status"] = "pending"
    doc["receipt_no"] = "UAC-ENR-" + str(uuid.uuid4().int)[:8]
    doc["created_at"] = now_iso()
    try:
        user = await get_current_user(request)
        doc["user_id"] = user["id"]
    except Exception:
        doc["user_id"] = None
    await db.enrollments.insert_one(doc)
    doc.pop("_id", None)
    
    # NEW CRM LOGIC: Create lead and AUTO-ASSIGN to a random counselor
    counselors = await db.users.find({"role": "counsellor"}, {"id": 1, "name": 1}).to_list(100)
    assigned_counselor = random.choice(counselors) if counselors else None
    
    lead_doc = {
        "id": str(uuid.uuid4()),
        "name": doc.get("name", ""),
        "phone": doc.get("phone", ""),
        "present_class": None,
        "moving_to_class": doc.get("course_title"),
        "address": None,
        "remarks": f"Enrolled online for {doc.get('course_title')}",
        "branch_id": "all",
        "counsellor_id": assigned_counselor["id"] if assigned_counselor else None,
        "status": "new",
        "temperature": "hot", 
        "source": "Online Enrollment",
        "interactions": [{
            "id": str(uuid.uuid4()),
            "type": "status_change",
            "notes": f"Lead automatically created from Online Enrollment. Auto-assigned to {assigned_counselor['name'] if assigned_counselor else 'nobody'}.",
            "created_at": doc["created_at"],
            "contacted_at": doc["created_at"],
            "created_by": "system",
            "created_by_name": "Website"
        }],
        "created_at": doc["created_at"],
        "created_by": "system"
    }
    await db.erp_leads.insert_one(lead_doc)
    asyncio.create_task(emit_enrollment({
        "receipt_no": doc["receipt_no"],
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "course_title": course["title"],
        "center": payload.center,
    }))
    background.add_task(email_enrollment_received, payload.email, payload.name, doc["receipt_no"], course["title"], payload.center)
    background.add_task(email_admin_notification, f"New enrollment: {payload.name}",
                       f"<p><b>{payload.name}</b> ({payload.email}, {payload.phone}) enrolled for <b>{course['title']}</b> at <b>{payload.center}</b>.<br/>Receipt: {doc['receipt_no']}</p>")
    return doc

@router.get("/enrollments")
async def list_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    _admin = Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"receipt_no": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"center": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.enrollments.count_documents(query)
    items = await db.enrollments.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    course_ids = list({e.get("course_id") for e in items if e.get("course_id")})
    if course_ids:
        c_map = {}
        async for c in db.courses.find({"$or": [{"id": {"$in": course_ids}}, {"slug": {"$in": course_ids}}]}, {"id": 1, "slug": 1, "title": 1}):
            title = c.get("title") or c.get("name") or c["id"]
            c_map[c["id"]] = title
            if c.get("slug"):
                c_map[c["slug"]] = title
        for e in items:
            cid = e.get("course_id")
            if cid:
                e["course_title"] = e.get("course_title") or c_map.get(cid, cid)
                e["course_name"] = e["course_title"]
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.get("/enrollments/mine")
async def my_enrollments(user: dict = Depends(get_current_user)):
    return await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(None)

@router.put("/enrollments/{eid}/status")
async def update_enrollment_status(eid: str, status: str = Query(...), _admin = Depends(require_admin)):
    if status not in ("pending", "approved", "rejected"):
        raise HTTPException(400, "Invalid status")
    await db.enrollments.update_one({"id": eid}, {"$set": {"status": status}})
    return {"ok": True}

