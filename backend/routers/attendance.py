from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Attendance (token-based, no login) ----------
async def _campaign_by_token(token: str):
    if not token:
        raise HTTPException(401, "Missing token")
    camp = await db.scholarships.find_one({"examiner_token": token}, {"_id": 0})
    if not camp:
        raise HTTPException(401, "Invalid examiner token")
    return camp

@router.get("/attendance/campaign")
async def attendance_campaign(token: str = Query(...)):
    camp = await _campaign_by_token(token)
    return {
        "id": camp["id"], "title": camp["title"],
        "exam_date": camp.get("exam_date"), "exam_time": camp.get("exam_time"),
        "available_venues": camp.get("available_venues") or [],
        "total_marks": camp.get("total_marks"),
    }

@router.get("/attendance/applications")
async def attendance_applications(token: str = Query(...), venue: Optional[str] = None):
    camp = await _campaign_by_token(token)
    q = {"scholarship_id": camp["id"]}
    if venue: q["venue"] = _sanitize_venue(venue)
    apps = await db.scholarship_applications.find(q, {"_id": 0}).sort("name", 1).to_list(None)
    appno_set = [a["application_no"] for a in apps]
    att_rows = await db.attendance.find({"scholarship_id": camp["id"], "application_no": {"$in": appno_set}}, {"_id": 0}).to_list(None)
    att_by = {a["application_no"]: a for a in att_rows}
    out = []
    for a in apps:
        rec = att_by.get(a["application_no"])
        out.append({
            "application_no": a["application_no"], "name": a["name"], "phone": a["phone"],
            "school": a.get("school"), "standard": a.get("standard"),
            "venue": _sanitize_venue(a.get("venue")),
            "attendance_status": (rec or {}).get("status"),
            "marked_at": (rec or {}).get("marked_at"),
        })
    return {"campaign_id": camp["id"], "venue": venue, "items": out,
            "marked_count": sum(1 for o in out if o["attendance_status"] == "present")}

@router.post("/attendance/mark")
async def attendance_mark(payload: AttendanceMarkIn):
    camp = await _campaign_by_token(payload.token)
    app_no = payload.application_no.strip()
    app_doc = await db.scholarship_applications.find_one(
        {"application_no": app_no, "scholarship_id": camp["id"]}, {"_id": 0}
    )
    if not app_doc:
        raise HTTPException(404, "Application not found for this campaign")
    rec = {
        "application_no": app_no,
        "scholarship_id": camp["id"],
        "venue": _sanitize_venue(payload.venue),
        "status": payload.status,
        "marked_at": now_iso(),
    }
    await db.attendance.update_one(
        {"application_no": app_no, "scholarship_id": camp["id"]},
        {"$set": rec}, upsert=True,
    )
    return {"ok": True, "application_no": app_no, "name": app_doc.get("name"), "status": payload.status, "marked_at": rec["marked_at"]}

@router.get("/admin/attendance/{sid}/export")
async def attendance_export(sid: str, _admin = Depends(require_admin)):
    camp = await db.scholarships.find_one({"id": sid}, {"_id": 0})
    if not camp:
        raise HTTPException(404, "Campaign not found")
        
    total_count = await db.scholarship_applications.count_documents({"scholarship_id": sid})
    if total_count == 0:
        raise HTTPException(404, "No scholarship applications found for this campaign")

    projection = {"application_no": 1, "name": 1, "phone": 1, "school": 1, "standard": 1, "venue": 1, "_id": 0}
    apps = await db.scholarship_applications.find({"scholarship_id": sid}, projection).to_list(None)
    
    att_rows = await db.attendance.find({"scholarship_id": sid}, {"_id": 0}).to_list(None)
    att = {a["application_no"]: a for a in att_rows}

    def _generate_attendance_excel():
        rows = []
        for a in apps:
            rec = att.get(a.get("application_no")) or {}
            rows.append({
                "application_no": str(a.get("application_no", "")),
                "name": str(a.get("name", "")),
                "phone": str(a.get("phone", "")),
                "school": str(a.get("school", "")),
                "standard": str(a.get("standard", "")),
                "venue": _sanitize_venue(a.get("venue")),
                "status": str(rec.get("status") or "absent"),
                "marked_at": str(rec.get("marked_at") or ""),
            })
        return export_excel(rows, "Attendance", f"attendance-{sid}.xlsx")

    return await asyncio.to_thread(_generate_attendance_excel)

