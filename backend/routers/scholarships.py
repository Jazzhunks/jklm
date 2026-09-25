from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Scholarships ----------
@router.get("/scholarships")
async def list_scholarships(include_wath: bool = False, type: Optional[str] = Query(None)):
    """Public scholarships list. WATH campaigns are excluded by default so they only appear on /wath."""
    q: Dict[str, Any] = {}
    if not include_wath:
        q["$and"] = [
            {"$or": [{"kind": {"$exists": False}}, {"kind": {"$ne": "wath"}}]},
            {"title": {"$not": {"$regex": "WATH", "$options": "i"}}}
        ]
    if type:
        q["$or"] = [
            {"type": type},
            {"type": {"$exists": False}},
        ]
    items = await db.scholarships.find(q, {"_id": 0, "examiner_token": 0}).sort("created_at", -1).to_list(100)
    return items

@router.get("/admin/scholarships")
async def list_scholarships_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    _admin = Depends(require_admin)
):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"slug": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.scholarships.count_documents(query)
    items = await db.scholarships.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.get("/scholarships/{sid}")
async def get_scholarship(sid: str):
    camp = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0, "examiner_token": 0})
    if not camp:
        raise HTTPException(404, "Campaign not found")
    return camp

@router.post("/scholarships")
async def create_scholarship(payload: ScholarshipIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["slug"] = await unique_slug("scholarships", doc["title"])
    doc["created_at"] = now_iso()
    doc["examiner_token"] = uuid.uuid4().hex
    if doc.get("available_venues"):
        doc["available_venues"] = [_sanitize_venue(v) for v in doc["available_venues"]]
    _validate_school_campaign(doc)
    await db.scholarships.insert_one(doc)
    if doc.get("is_featured"):
        await _clear_featured_except("scholarships", doc["id"])
    doc.pop("_id", None)
    asyncio.create_task(notify_students(
        "New Scholarship Campaign",
        doc.get("title", "A new scholarship campaign is now open."),
        data={"type": "campaign", "scholarship_id": doc.get("id")},
        url="/scholarship",
    ))
    return doc

@router.put("/scholarships/{sid}")
async def update_scholarship(sid: str, payload: ScholarshipIn, _admin = Depends(require_admin)):
    existing = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    real_id = existing["id"] if existing else sid
    data = payload.model_dump()
    data["slug"] = await unique_slug("scholarships", data["title"], exclude_id=real_id)
    if data.get("available_venues"):
        data["available_venues"] = [_sanitize_venue(v) for v in data["available_venues"]]
    _validate_school_campaign(data)
    await db.scholarships.update_one({"id": real_id}, {"$set": data})
    if data.get("is_featured"):
        await _clear_featured_except("scholarships", real_id)
    return await db.scholarships.find_one({"id": real_id}, {"_id": 0})

@router.post("/admin/scholarships/{sid}/regenerate-token")
async def regenerate_examiner_token(sid: str, _admin = Depends(require_admin)):
    existing = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    real_id = existing["id"] if existing else sid
    new_token = uuid.uuid4().hex
    res = await db.scholarships.update_one({"id": real_id}, {"$set": {"examiner_token": new_token}})
    if not res.matched_count:
        raise HTTPException(404, "Campaign not found")
    return {"examiner_token": new_token}

@router.delete("/scholarships/{sid}")
async def delete_scholarship(sid: str, _admin = Depends(require_admin)):
    await db.scholarships.update_one({"$or": [{"id": sid}, {"slug": sid}]}, {"$set": {"is_deleted": True}})
    return {"ok": True}

@router.post("/scholarship-applications")
async def apply_scholarship(payload: ScholarshipApplicationIn, background: BackgroundTasks, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"scholarship_app:{client_ip}", max_requests=15, window_seconds=60)

    # -------- Resolve target: scholarship campaign OR WATH Carnival --------
    campaign: Optional[Dict[str, Any]] = None
    carnival: Optional[Dict[str, Any]] = None
    campaign_kind = "scholarship"

    if payload.carnival_id:
        carnival = await db.wath_carnivals.find_one({"id": payload.carnival_id}, {"_id": 0})
        if not carnival or not carnival.get("active", True):
            raise HTTPException(404, "Carnival not found or inactive")
        if not payload.chosen_date or not payload.chosen_slot_time:
            raise HTTPException(400, "Please pick an exam date and time slot")
        campaign_kind = "carnival"
    elif payload.scholarship_id:
        campaign = await db.scholarships.find_one({"$or": [{"id": payload.scholarship_id}, {"slug": payload.scholarship_id}]}, {"_id": 0})
        if not campaign:
            raise HTTPException(404, "Scholarship campaign not found")
        if not campaign.get("active"):
            raise HTTPException(400, "Scholarship campaign is closed")
        campaign_kind = campaign.get("kind", "scholarship")
    else:
        raise HTTPException(400, "scholarship_id or carnival_id required")

    clean_email = payload.email.lower().strip()
    clean_phone = payload.phone.strip()

    # VERIFY OTP
    if not payload.otp_code:
        raise HTTPException(400, "OTP verification code is required")
    
    otp_record = await db.otps.find_one({"phone": clean_phone}, sort=[("expires_at", -1)])
    if not otp_record or otp_record["code"] != payload.otp_code.strip() or otp_record["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired OTP")
    # Delete OTP to prevent reuse
    await db.otps.delete_one({"_id": otp_record["_id"]})

    # Duplicate check within the same campaign or carnival
    dup_query: Dict[str, Any] = {"$or": [{"email": clean_email}, {"phone": clean_phone}]}
    if payload.carnival_id:
        dup_query["carnival_id"] = payload.carnival_id
    else:
        dup_query["scholarship_id"] = payload.scholarship_id

    existing_app = await db.scholarship_applications.find_one(dup_query)
    if existing_app:
        msg = f"An application already exists with this data (App No: {existing_app.get('application_no')})."
        raise HTTPException(status_code=400, detail=msg)

    selected_venue = _sanitize_venue(payload.venue)

    # If carnival: try to reserve the slot atomically BEFORE inserting the app
    if carnival:
        ok = await try_reserve_slot(db, carnival["id"], payload.chosen_date, payload.chosen_slot_time)
        if not ok:
            raise HTTPException(409, "This slot is now full or closed — please pick another")

    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["email"] = clean_email
    doc["phone"] = clean_phone
    doc["campaign_kind"] = campaign_kind
    doc["source"] = "self"

    if campaign and doc.get("scholarship_id"):
        doc["scholarship_id"] = campaign["id"]

    for _ in range(10):
        candidate = str(random.randint(10000000, 99999999))
        if not await db.scholarship_applications.find_one({"application_no": candidate}):
            doc["application_no"] = candidate
            break
    else:
        doc["application_no"] = str(int(datetime.now(timezone.utc).timestamp() * 1000))[-8:]

    doc["status"] = "pending"
    if campaign:
        doc["scholarship_title"] = campaign.get("title", "")
        exam_date_str = campaign.get("exam_date", "TBA")
        exam_time_str = campaign.get("exam_time", "10:00 AM")
        title_for_email = campaign.get("title") or payload.target_exam
    else:
        doc["scholarship_title"] = carnival.get("title", "WATH Carnival")
        exam_date_str = payload.chosen_date
        exam_time_str = payload.chosen_slot_time
        title_for_email = carnival.get("title") or "WATH Carnival"
    doc["venue"] = selected_venue
    doc["created_at"] = now_iso()

    try:
        await db.scholarship_applications.insert_one(doc)
    except Exception:
        # Roll back the slot reservation if the insert fails
        if carnival:
            await release_slot(db, carnival["id"], payload.chosen_date, payload.chosen_slot_time)
        raise
    doc.pop("_id", None)
    doc["whatsapp_community_url"] = (campaign or carnival or {}).get("whatsapp_community_url")

    asyncio.create_task(emit_scholarship_application({
        "application_no": doc["application_no"],
        "name": payload.name,
        "email": clean_email,
        "phone": clean_phone,
        "campaign_kind": campaign_kind,
        "scholarship_title": title_for_email,
        "venue": selected_venue,
    }))
    asyncio.create_task(notify_admins(
        "New Scholarship Application",
        f"{payload.name} applied for {title_for_email}. App No: {doc['application_no']}",
        data={"type": "scholarship_application", "application_no": doc["application_no"]},
    ))

    if carnival:
        background.add_task(
            _safe_send_carnival_booking_notification,
            {
                "venue": selected_venue,
                "name": payload.name,
                "phone": clean_phone,
                "chosen_date": payload.chosen_date,
                "chosen_slot_time": payload.chosen_slot_time,
                "standard": payload.standard,
            },
        )
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        marker_key = f"carnival_daily_summary:{carnival.get('id', payload.carnival_id)}:{today}"
        marker = await db.system_meta.find_one({"key": marker_key}, {"_id": 0})
        if marker:
            background.add_task(_safe_send_carnival_daily_summary, True)

    admit_pdf_bytes = None
    try:
        admit_pdf_bytes = admit_card_pdf(
            application_no=doc["application_no"],
            name=payload.name, phone=payload.phone, school=payload.school,
            standard=payload.standard, target_exam=payload.target_exam,
            exam_date=exam_date_str, venue=selected_venue,
            exam_time=exam_time_str,
            scholarship_title=title_for_email,
            father_name=payload.father_name, gender=payload.gender,
            dob=payload.dob, email=payload.email,
            address=payload.address, district=payload.district,
        )
    except Exception as e:
        logging.error(f"Failed to generate Admit Card PDF: {e}")

    background.add_task(
        email_scholarship_received, payload.email, payload.name, doc["application_no"], payload.target_exam, admit_pdf_bytes
    )
    background.add_task(
        email_admin_notification, f"New {campaign_kind} application: {payload.name}",
        f"<p><b>{payload.name}</b> from {payload.school} ({payload.standard}) applied for <b>{title_for_email}</b> at <b>{doc['venue']}</b>.<br/>App No: {doc['application_no']}<br/>Phone: {payload.phone}<br/>Slot: {exam_date_str} · {exam_time_str}</p>"
    )

    if admit_pdf_bytes:
        background.add_task(
            _safe_send_whatsapp_admit_card,
            phone=payload.phone,
            name=payload.name,
            application_no=doc["application_no"],
            scholarship_title=title_for_email,
            standard=payload.standard,
            exam_date=exam_date_str,
            exam_time=exam_time_str,
            venue=selected_venue,
            pdf_bytes=admit_pdf_bytes,
        )

    return doc

@router.put("/scholarship-applications/{application_no}")
async def update_scholarship_application(
    application_no: str,
    payload: ScholarshipApplicationUpdateIn,
    _admin = Depends(require_admin)
):
    """Update applicant details, including school venues and contact details."""
    existing_app = await db.scholarship_applications.find_one({"application_no": application_no.strip()})
    if not existing_app:
        existing_app = await db.scholarship_applications.find_one({"id": application_no.strip()})
        if not existing_app:
            raise HTTPException(status_code=404, detail="Scholarship application not found")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    if "email" in update_data:
        update_data["email"] = update_data["email"].lower().strip()
    if "phone" in update_data:
        update_data["phone"] = update_data["phone"].strip()
    if "venue" in update_data:
        update_data["venue"] = _sanitize_venue(update_data["venue"])

    update_data["updated_at"] = now_iso()

    await db.scholarship_applications.update_one(
        {"_id": existing_app["_id"]},
        {"$set": update_data}
    )

    updated_doc = await db.scholarship_applications.find_one({"_id": existing_app["_id"]}, {"_id": 0})
    return updated_doc

@router.get("/scholarship-applications")
async def list_scholarship_apps(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    campaign_kind: str = Query(None),
    _admin = Depends(require_admin)
):
    query = {}
    if campaign_kind:
        query["campaign_kind"] = campaign_kind
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"application_no": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"school": {"$regex": search, "$options": "i"}}
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.scholarship_applications.count_documents(query)
    items = await db.scholarship_applications.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.post("/admin/scholarships/{scholarship_id}/notify-applicants")
async def notify_scholarship_applicants(
    scholarship_id: str, background: BackgroundTasks, _admin = Depends(require_admin)
):
    campaign = await db.scholarships.find_one({"id": scholarship_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Scholarship campaign not found")

    total_applicants = await db.scholarship_applications.count_documents({"scholarship_id": scholarship_id})
    if total_applicants == 0:
        raise HTTPException(status_code=400, detail="No applicants found for this scholarship")

    job_id = new_id()
    await db.bulk_jobs.insert_one({
        "id": job_id,
        "scholarship_id": scholarship_id,
        "status": "initializing",
        "total_rows": total_applicants,
        "processed": 0,
        "success": 0,
        "errors": 0,
        "recent_logs": [f"🚀 Starting WhatsApp broadcast for {total_applicants} applicants..."],
        "created_at": now_iso()
    })

    background.add_task(broadcast_scholarship_details, scholarship_id, job_id)
    asyncio.create_task(emit_broadcast_complete({
        "job_id": job_id,
        "scholarship_id": scholarship_id,
        "total_applicants": total_applicants,
    }))

    return {
        "status": "accepted",
        "message": f"Notification broadcast started for {total_applicants} applicants.",
        "scholarship_id": scholarship_id,
        "job_id": job_id
    }

# ---------- Per-campaign Registrations Dashboard ----------
@router.get("/scholarships/{sid}/stats")
async def scholarship_stats(sid: str, request: Request, token: str | None = None):
    camp = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not camp:
        raise HTTPException(404, "Campaign not found")
    real_id = camp["id"]

    # Collect all scholarships that represent the same campaign:
    # 1. The resolved primary scholarship
    # 2. Any other scholarships sharing the same slug
    related_ids = [real_id]
    if camp.get("slug"):
        related_camps = await db.scholarships.find({"slug": camp["slug"]}, {"_id": 0}).to_list(None)
        for rc in related_camps:
            if rc.get("id") and rc["id"] not in related_ids:
                related_ids.append(rc["id"])

    # Check authorization or examiner token
    is_authorized = False
    try:
        user = await get_current_user(request)
        if user and user.get("role") in ("admin", "super_admin"):
            is_authorized = True
    except HTTPException:
        pass

    if not is_authorized and token and camp.get("examiner_token") == token:
        is_authorized = True

    if not is_authorized:
        raise HTTPException(401, "Authentication required to view stats")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    prev_week_start = today_start - timedelta(days=14)

    apps = await db.scholarship_applications.find(
        {"$or": [{"scholarship_id": rid} for rid in related_ids] + [{"scholarship_id": camp.get("slug")}]}, {"_id": 0, "venue": 1, "created_at": 1}
    ).to_list(None)

    def _parse(ts):
        if not ts:
            return None
        try:
            return datetime.fromisoformat(ts.replace("Z", "+00:00")) if isinstance(ts, str) else ts
        except Exception:
            return None

    venues_seed = list(camp.get("available_venues") or [])
    for rc in related_camps:
        for v in rc.get("available_venues") or []:
            if v not in venues_seed:
                venues_seed.append(v)
    venues = {v: {"venue": v, "total": 0, "today": 0, "last_7_days": 0} for v in venues_seed}

    total = 0
    this_week = 0
    prev_week = 0
    for a in apps:
        total += 1
        v = a.get("venue") or "—"
        if v not in venues:
            venues[v] = {"venue": v, "total": 0, "today": 0, "last_7_days": 0}
        venues[v]["total"] += 1
        ts = _parse(a.get("created_at"))
        if ts:
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            if ts >= today_start:
                venues[v]["today"] += 1
            if ts >= week_start:
                venues[v]["last_7_days"] += 1
                this_week += 1
            elif ts >= prev_week_start:
                prev_week += 1

    by_venue = sorted(venues.values(), key=lambda x: (-x["total"], x["venue"]))
    top_venue = by_venue[0]["venue"] if by_venue and by_venue[0]["total"] > 0 else None

    if prev_week > 0:
        wow_growth_pct = round(((this_week - prev_week) / prev_week) * 100, 2)
    else:
        wow_growth_pct = 100.0 if this_week > 0 else 0.0

    return {
        "campaign": {"id": camp["id"], "slug": camp.get("slug"), "title": camp.get("title"), "exam_date": camp.get("exam_date")},
        "total_registrations": total,
        "wow_growth_pct": wow_growth_pct,
        "this_week": this_week,
        "prev_week": prev_week,
        "by_venue": by_venue,
        "top_venue": top_venue,
        "as_of": now.isoformat(),
    }


@router.get("/scholarship-applications/mine")
async def my_scholarship_applications(user: dict = Depends(get_current_user)):
    q = {"$or": [{"email": user.get("email")}]}
    if user.get("phone"):
        q["$or"].append({"phone": user["phone"]})
    apps = await db.scholarship_applications.find(q, {"_id": 0}).sort("created_at", -1).to_list(None)
    for a in apps:
        if not a.get("result_published"):
            for k in ("result_marks_obtained", "result_total_marks", "result_rank", "result_percentile", "result_scholarship_percentage", "result_remarks"):
                a.pop(k, None)
    return apps


@router.get("/scholarship-applications/{application_no}")
async def get_scholarship_app_by_no(application_no: str, phone: Optional[str] = Query(None)):
    if not phone:
        raise HTTPException(400, "Phone number is required to view this application")
    app_doc = await db.scholarship_applications.find_one(
        {"application_no": application_no.strip(), "phone": phone.strip()},
        {"_id": 0}
    )
    if not app_doc:
        raise HTTPException(404, "No application found with this number and phone")
    if not app_doc.get("result_published"):
        for k in ("result_marks_obtained", "result_total_marks", "result_rank", "result_percentile", "result_scholarship_percentage", "result_remarks"):
            app_doc.pop(k, None)
    return app_doc

@router.put("/scholarship-applications/{aid}/status")
async def update_scholarship_status(aid: str, status: str = Query(...), _admin = Depends(require_admin)):
    if status not in ("pending", "approved", "rejected"):
        raise HTTPException(400, "Invalid status")
    await db.scholarship_applications.update_one({"id": aid}, {"$set": {"status": status}})
    return {"ok": True}

# ---------- Scholarship Result management ----------
@router.put("/scholarship-applications/{aid}/result")
async def set_scholarship_result(aid: str, payload: ScholarshipResultIn, background: BackgroundTasks, _admin = Depends(require_admin)):
    app_doc = await db.scholarship_applications.find_one({"id": aid}, {"_id": 0})
    if not app_doc:
        raise HTTPException(404, "Application not found")
    pct = max(0, min(100, payload.scholarship_percentage))
    update = {
        "result_marks_obtained": payload.marks_obtained,
        "result_total_marks": payload.total_marks,
        "result_rank": payload.rank,
        "result_percentile": payload.percentile,
        "result_scholarship_percentage": pct,
        "result_remarks": payload.remarks,
        "result_published": bool(payload.publish),
    }
    was_published = bool(app_doc.get("result_published"))
    if payload.publish:
        update["result_published_at"] = now_iso()
    await db.scholarship_applications.update_one({"id": aid}, {"$set": update})
    if payload.publish and not was_published and app_doc.get("email"):
        front = os.environ.get("FRONTEND_URL", "").rstrip("/")
        result_url = (f"{front}/api/scholarship-applications/{app_doc['application_no']}/result-card"
                      f"?phone={app_doc.get('phone','')}") if front else None
        background.add_task(
            email_scholarship_result_published,
            app_doc["email"], app_doc.get("name", ""), app_doc["application_no"],
            pct, payload.marks_obtained, payload.total_marks, payload.rank,
            result_url,
        )
        asyncio.create_task(emit_result_published({
            "application_no": app_doc["application_no"],
            "name": app_doc.get("name", ""),
            "email": app_doc.get("email", ""),
            "scholarship_percentage": pct,
        }))
        asyncio.create_task(notify_students(
            "Result Published",
            f"Your result for {app_doc.get('target_exam', 'the exam')} is now available. App No: {app_doc['application_no']}",
            data={"type": "result_published", "application_no": app_doc["application_no"]},
            url=f"/scholarship/result?app_no={app_doc['application_no']}",
        ))
    return {"ok": True, **update}

@router.post("/scholarship-applications/lookup")
async def lookup_scholarship(payload: ScholarshipLookupIn):
    app_doc = await db.scholarship_applications.find_one(
        {"application_no": payload.application_no.strip(), "phone": payload.phone.strip()},
        {"_id": 0}
    )
    if not app_doc:
        raise HTTPException(404, "No application found with this number and phone")
    if not app_doc.get("result_published"):
        for k in ("result_marks_obtained", "result_total_marks", "result_rank", "result_percentile", "result_scholarship_percentage", "result_remarks"):
            app_doc.pop(k, None)
    return app_doc

# ---------- Scholarship results: template + bulk upload ----------
RESULT_HEADERS = ["application_no", "name", "school", "standard",
                  "marks_obtained", "total_marks", "rank", "percentile",
                  "scholarship_percentage", "remarks", "publish"]

@router.get("/admin/scholarships/{sid}/results-template")
async def results_template(sid: str, _admin = Depends(require_admin)):
    camp = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0, "total_marks": 1, "title": 1})
    if not camp:
        camp = await db.wath_carnivals.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0, "title": 1})
    if not camp:
        raise HTTPException(404, "Campaign or Carnival not found")
        
    real_id = camp.get("id") or sid
    total_count = await db.scholarship_applications.count_documents({"$or": [{"scholarship_id": real_id}, {"carnival_id": real_id}, {"scholarship_id": sid}, {"carnival_id": sid}]})
    if total_count == 0:
        raise HTTPException(404, "No scholarship applications found for this campaign")

    projection = {"application_no": 1, "name": 1, "school": 1, "standard": 1, "_id": 0}
    apps = await db.scholarship_applications.find({"scholarship_id": sid}, projection).sort("name", 1).to_list(None)
    total_marks_default = camp.get("total_marks") or 100

    def _generate_excel():
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Results"
        ws.append(RESULT_HEADERS)
        for cell in ws[1]:
            cell.font = openpyxl.styles.Font(bold=True)
            
        for a in apps:
            ws.append([
                str(a.get("application_no", "")),
                str(a.get("name", "")),
                str(a.get("school", "")),
                str(a.get("standard", "")),
                "", total_marks_default, "", "", "", "", "no",
            ])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return buf

    buf = await asyncio.to_thread(_generate_excel)
    file_size = buf.getbuffer().nbytes

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="results-template-{sid}.xlsx"',
            "Content-Length": str(file_size)
        }
    )
    
@router.post("/admin/scholarships/{sid}/bulk-results")
async def bulk_results(sid: str, background: BackgroundTasks,
                       file: UploadFile = File(...), _admin = Depends(require_admin)):
    camp = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not camp:
        camp = await db.wath_carnivals.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not camp:
        raise HTTPException(404, "Campaign or Carnival not found")
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file")
    try:
        wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
        ws = wb.active
    except Exception as e:
        raise HTTPException(400, f"Could not read Excel: {e}")

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(400, "Sheet is empty")
    headers = [str(h or "").strip().lower() for h in rows[0]]
    h_idx = {h: i for i, h in enumerate(headers)}
    required = ["application_no", "marks_obtained", "scholarship_percentage"]
    missing = [r for r in required if r not in h_idx]
    if missing:
        raise HTTPException(400, f"Missing columns: {missing}. Expected: {RESULT_HEADERS}")

    front = os.environ.get("FRONTEND_URL", "").rstrip("/")
    processed, published_count, errors = 0, 0, []
    for row_no, row in enumerate(rows[1:], start=2):
        try:
            app_no = (str(row[h_idx["application_no"]]).strip() if row[h_idx["application_no"]] is not None else "")
            if not app_no:
                continue
            marks = float(row[h_idx["marks_obtained"]] or 0)
            total = float(row[h_idx.get("total_marks", -1)] or camp.get("total_marks") or 100) if "total_marks" in h_idx else float(camp.get("total_marks") or 100)
            sch_pct = max(0, min(100, int(float(row[h_idx["scholarship_percentage"]] or 0))))
            rank = row[h_idx.get("rank", -1)] if "rank" in h_idx else None
            rank_v = int(rank) if rank not in (None, "", 0) else None
            perc = row[h_idx.get("percentile", -1)] if "percentile" in h_idx else None
            perc_v = float(perc) if perc not in (None, "") else None
            remarks = row[h_idx.get("remarks", -1)] if "remarks" in h_idx else None
            remarks_v = str(remarks).strip() if remarks not in (None, "") else None
            pub_raw = row[h_idx.get("publish", -1)] if "publish" in h_idx else "yes"
            publish = str(pub_raw).strip().lower() in ("yes", "true", "1", "y", "publish", "published")

            app_doc = await db.scholarship_applications.find_one(
                {"application_no": app_no, "scholarship_id": sid}, {"_id": 0}
            )
            if not app_doc:
                errors.append({"row": row_no, "app": app_no, "error": "not in this campaign"})
                continue

            was_published = bool(app_doc.get("result_published"))
            update = {
                "result_marks_obtained": marks,
                "result_total_marks": total,
                "result_rank": rank_v,
                "result_percentile": perc_v,
                "result_scholarship_percentage": sch_pct,
                "result_remarks": remarks_v,
                "result_published": publish,
            }
            if publish:
                update["result_published_at"] = now_iso()
                published_count += 1
            await db.scholarship_applications.update_one({"id": app_doc["id"]}, {"$set": update})
            processed += 1

            if publish and not was_published and app_doc.get("email"):
                result_url = (f"{front}/api/scholarship-applications/{app_no}/result-card"
                              f"?phone={app_doc.get('phone','')}") if front else None
                background.add_task(
                    email_scholarship_result_published,
                    app_doc["email"], app_doc.get("name", ""), app_no,
                    sch_pct, marks, total, rank_v, result_url,
                )
        except Exception as e:
            errors.append({"row": row_no, "app": app_no if 'app_no' in locals() else "", "error": str(e)})
    return {"processed": processed, "published": published_count, "errors": errors}

# ---------- Bulk Scholarship Registration Endpoint ----------

BULK_SCHOLARSHIP_HEADERS = [
    "full_name", "email", "phone", "class", "school_institute", "venue"
]

@router.get("/admin/scholarships/{sid}/bulk-register-template")
async def bulk_register_template(sid: str, _admin = Depends(require_admin)):
    camp = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not camp:
        camp = await db.wath_carnivals.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not camp:
        raise HTTPException(404, "Campaign or Carnival not found")
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Bulk Registrations"
    ws.append(BULK_SCHOLARSHIP_HEADERS)
    sample_venue = (camp.get("available_venues") or ["90 FT"])[0]
    ws.append([
        "Aarav Sharma", "aarav@example.com", "9999900000",
        "Class 10", "DPS Srinagar", sample_venue,
    ])
    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)
    for col in ws.columns:
        max_len = max(len(str(c.value or "")) for c in col)
        ws.column_dimensions[col[0].column_letter].width = min(max(max_len + 2, 14), 40)
    buf = io.BytesIO(); wb.save(buf); buf.seek(0)
    filename = f"bulk-register-template-{sid}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------- BULK UPLOAD ASYNC WORKER ----------

async def _process_bulk_file_bg(job_id: str, sid: str, file_path: str):
    try:
        campaign = await db.scholarships.find_one({"id": sid}, {"_id": 0})
        if not campaign:
            raise Exception("Campaign not found during processing.")
        real_sid = campaign.get("id", sid)

        wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        
        if not rows or len(rows) < 2:
            raise Exception("Sheet is empty or missing data rows.")

        raw_headers = [str(h or "").strip().lower().replace(" ", "_").replace("/", "_") for h in rows[0]]
        header_map = {}
        for idx, h in enumerate(raw_headers):
            if "name" in h and "school" not in h and "institute" not in h: header_map["name"] = idx
            elif "email" in h: header_map["email"] = idx
            elif "phone" in h or "mobile" in h or "contact" in h: header_map["phone"] = idx
            elif "class" in h or "standard" in h or "grade" in h: header_map["standard"] = idx
            elif "school" in h or "institute" in h: header_map["school"] = idx
            elif "venue" in h or "location" in h or "center" in h: header_map["venue"] = idx

        for req in ("name", "email", "phone"):
            if req not in header_map:
                raise Exception(f"Missing required column: {req}")

        valid_rows = [r for r in rows[1:] if any(c is not None and str(c).strip() != "" for c in r)]
        total_rows = len(valid_rows)

        await db.bulk_jobs.update_one(
            {"id": job_id}, 
            {"$set": {"status": "processing", "total_rows": total_rows}}
        )

        for row_no, row in enumerate(valid_rows, start=2):
            try:
                def _cell(key: str, default: str = "") -> str:
                    idx = header_map.get(key)
                    if idx is None or idx >= len(row) or row[idx] is None: return default
                    return str(row[idx]).strip()

                name = _cell("name")
                email = _cell("email").lower()
                phone_raw = _cell("phone")
                phone = str(phone_raw).split(".")[0].strip() if phone_raw else ""
                standard = _cell("standard", "General")
                school = _cell("school", "N/A")
                venue = _sanitize_venue(_cell("venue"))

                if not name or not email or not phone:
                    raise ValueError(f"Missing required data for Name: {name}")

                existing = await db.scholarship_applications.find_one({
                    "$or": [
                        {"scholarship_id": real_sid, "$or": [{"email": email}, {"phone": phone}]},
                        {"carnival_id": real_sid, "$or": [{"email": email}, {"phone": phone}]},
                    ]
                })
                
                if existing:
                    log_msg = f"⚠️ Skipped {name} (Row {row_no}): Already registered."
                    await db.bulk_jobs.update_one({"id": job_id}, {
                        "$inc": {"processed": 1, "errors": 1},
                        "$push": {"recent_logs": {"$each": [log_msg], "$slice": -15}}
                    })
                    continue

                for _ in range(10):
                    candidate = str(random.randint(10000000, 99999999))
                    if not await db.scholarship_applications.find_one({"application_no": candidate}):
                        app_no = candidate
                        break
                else:
                    app_no = str(int(datetime.now(timezone.utc).timestamp() * 1000))[-8:]
                
                is_carnival = campaign.get("exam_dates") is not None
                doc = {
                    "id": new_id(),
                    "application_no": app_no,
                    "scholarship_id": None if is_carnival else real_sid,
                    "carnival_id": real_sid if is_carnival else None,
                    "scholarship_title": campaign.get("title", "Scholarship Test"),
                    "name": name, "email": email, "phone": phone,
                    "standard": standard, "school": school,
                    "target_exam": standard, "city": venue, "venue": venue,
                    "status": "approved",
                    "created_at": now_iso(),
                }
                await db.scholarship_applications.insert_one(doc)

                admit_pdf_bytes = None
                try:
                    admit_pdf_bytes = admit_card_pdf(
                        application_no=app_no, name=name, phone=phone, school=school,
                        standard=standard, target_exam=standard,
                        exam_date=campaign.get("exam_date", "TBA"), venue=venue,
                        exam_time=campaign.get("exam_time", "10:00 AM"),
                        scholarship_title=campaign.get("title", "Scholarship Test"),
                        father_name=doc.get("father_name"), gender=doc.get("gender"),
                        dob=doc.get("dob"), email=doc.get("email"),
                        address=doc.get("address"), district=doc.get("district"),
                    )
                except Exception as e:
                    logging.error(f"PDF gen failed for {app_no}: {e}")

                asyncio.create_task(
                    _run_maybe_async(
                        email_scholarship_received,
                        email, name, app_no, standard, admit_pdf_bytes
                    )
                )

                if admit_pdf_bytes:
                    asyncio.create_task(
                        _run_maybe_async(
                            send_whatsapp_admit_card,
                            phone=phone,
                            name=name,
                            application_no=app_no,
                            scholarship_title=campaign.get("title") or standard,
                            standard=standard,
                            exam_date=campaign.get("exam_date") or "TBA",
                            exam_time=campaign.get("exam_time", "10:00 AM"),
                            venue=venue,
                            pdf_bytes=admit_pdf_bytes,
                        )
                    )
                        
                log_msg = f"✅ Success: {name} - Registered & WhatsApp Queued"
                await db.bulk_jobs.update_one({"id": job_id}, {
                    "$inc": {"processed": 1, "success": 1},
                    "$push": {"recent_logs": {"$each": [log_msg], "$slice": -15}}
                })
                
                await asyncio.sleep(0.01)

            except Exception as row_err:
                log_msg = f"❌ Error row {row_no} ({name if 'name' in locals() else 'Unknown'}): {str(row_err)}"
                await db.bulk_jobs.update_one({"id": job_id}, {
                    "$inc": {"processed": 1, "errors": 1},
                    "$push": {"recent_logs": {"$each": [log_msg], "$slice": -15}}
                })

        await db.bulk_jobs.update_one({"id": job_id}, {"$set": {"status": "completed"}})

    except Exception as e:
        await db.bulk_jobs.update_one({"id": job_id}, {
            "$set": {"status": "failed"}, 
            "$push": {"recent_logs": {"$each": [f"💥 FATAL ERROR: {str(e)}"], "$slice": -15}}
        })
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/admin/scholarships/{sid}/bulk-register")
async def bulk_register_scholarship(
    sid: str,
    background: BackgroundTasks,
    file: UploadFile = File(...),
    _admin = Depends(require_admin),
):
    campaign = await db.scholarships.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not campaign:
        campaign = await db.wath_carnivals.find_one({"$or": [{"id": sid}, {"slug": sid}]}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Campaign or Carnival not found")
    real_sid = campaign["id"]

    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file")

    try:
        wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
    except Exception as e:
        raise HTTPException(400, f"Could not read Excel file: {e}")

    if not rows or len(rows) < 2:
        return {"registered": 0, "skipped": 0, "total_rows": 0, "errors": []}

    raw_headers = [str(h or "").strip().lower().replace(" ", "_").replace("/", "_") for h in rows[0]]
    header_map = {}
    for idx, h in enumerate(raw_headers):
        if "name" in h and "school" not in h and "institute" not in h: header_map["name"] = idx
        elif "email" in h: header_map["email"] = idx
        elif "phone" in h or "mobile" in h or "contact" in h: header_map["phone"] = idx
        elif "class" in h or "standard" in h or "grade" in h: header_map["standard"] = idx
        elif "school" in h or "institute" in h: header_map["school"] = idx
        elif "venue" in h or "location" in h or "center" in h: header_map["venue"] = idx

    registered = 0
    skipped = 0
    errors = []

    valid_rows = [r for r in rows[1:] if any(c is not None and str(c).strip() != "" for c in r)]

    for row_no, row in enumerate(valid_rows, start=2):
        def _cell(key: str, default: str = "") -> str:
            idx = header_map.get(key)
            if idx is None or idx >= len(row) or row[idx] is None: return default
            return str(row[idx]).strip()

        name = _cell("name")
        email = _cell("email").lower()
        phone_raw = _cell("phone")
        phone = str(phone_raw).split(".")[0].strip() if phone_raw else ""
        standard = _cell("standard", "General")
        school = _cell("school", "N/A")
        venue = _sanitize_venue(_cell("venue"))

        if not name or not email or not phone:
            skipped += 1
            errors.append({
                "row": row_no,
                "reason": "missing_required",
                "message": f"Row {row_no} is missing required fields (name, email, or phone)."
            })
            continue

        existing = await db.scholarship_applications.find_one({
            "scholarship_id": real_sid,
            "$or": [{"email": email}, {"phone": phone}],
        })

        if existing:
            skipped += 1
            errors.append({
                "row": row_no,
                "reason": "duplicate",
                "application_no": existing.get("application_no"),
                "message": f"Row {row_no} ({name}): Email or phone already registered."
            })
            continue

        for _ in range(10):
            candidate = str(random.randint(10000000, 99999999))
            if not await db.scholarship_applications.find_one({"application_no": candidate}):
                app_no = candidate
                break
        else:
            app_no = str(int(datetime.now(timezone.utc).timestamp() * 1000))[-8:]

        doc = {
            "id": new_id(),
            "application_no": app_no,
            "scholarship_id": real_sid,
            "scholarship_title": campaign.get("title", "Scholarship Test"),
            "name": name, "email": email, "phone": phone,
            "standard": standard, "school": school,
            "target_exam": standard, "city": venue, "venue": venue,
            "status": "approved",
            "created_at": now_iso(),
        }
        await db.scholarship_applications.insert_one(doc)
        registered += 1

        admit_pdf_bytes = None
        try:
            admit_pdf_bytes = admit_card_pdf(
                application_no=app_no, name=name, phone=phone, school=school,
                standard=standard, target_exam=standard,
                exam_date=campaign.get("exam_date", "TBA"), venue=venue,
                exam_time=campaign.get("exam_time", "10:00 AM"),
                scholarship_title=campaign.get("title", "Scholarship Test"),
                father_name=doc.get("father_name"), gender=doc.get("gender"),
                dob=doc.get("dob"), email=doc.get("email"),
                address=doc.get("address"), district=doc.get("district"),
            )
        except Exception as e:
            logging.error(f"PDF gen failed for {app_no}: {e}")

        background.add_task(
            email_scholarship_received, email, name, app_no, standard, admit_pdf_bytes
        )

        if admit_pdf_bytes:
            background.add_task(
                _safe_send_whatsapp_admit_card,
                phone=phone,
                name=name,
                application_no=app_no,
                scholarship_title=campaign.get("title") or standard,
                standard=standard,
                exam_date=campaign.get("exam_date") or "TBA",
                exam_time=campaign.get("exam_time", "10:00 AM"),
                venue=venue,
                pdf_bytes=admit_pdf_bytes,
            )

    job_id = new_id()
    job_doc = {
        "id": job_id,
        "scholarship_id": real_sid,
        "status": "completed",
        "total_rows": len(valid_rows),
        "processed": len(valid_rows),
        "success": registered,
        "errors": skipped,
        "recent_logs": [f"✅ Processed {len(valid_rows)} rows: {registered} registered, {skipped} skipped."],
        "created_at": now_iso()
    }
    await db.bulk_jobs.insert_one(job_doc)

    return {
        "status": "accepted",
        "job_id": job_id,
        "registered": registered,
        "skipped": skipped,
        "total_rows": len(valid_rows),
        "errors": errors
    }


@router.get("/admin/bulk-jobs/{job_id}")
async def get_bulk_job_status(job_id: str, _admin = Depends(require_admin)):
    job = await db.bulk_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(404, "Job not found")
    return job

# ---------- Scholarship admit card PDF ----------
@router.get("/scholarship-applications/{application_no}/admit-card")
async def admit_card(application_no: str, phone: Optional[str] = Query(None), request: Request = None):
    is_admin = False
    try:
        if request:
            user = await get_current_user(request)
            is_admin = bool(user and user.get("role") in ("admin", "super_admin"))
    except HTTPException:
        is_admin = False

    if is_admin:
        app_doc = await db.scholarship_applications.find_one({"application_no": application_no}, {"_id": 0})
    else:
        if not phone:
            raise HTTPException(400, "Phone number required to download admit card")
        app_doc = await db.scholarship_applications.find_one(
            {"application_no": application_no, "phone": phone.strip()}, {"_id": 0}
        )

    if not app_doc:
        raise HTTPException(404, "Application not found")

    # Resolve exam context: prefer carnival (if this app booked a slot), then scholarship campaign.
    carnival = None
    campaign = None
    if app_doc.get("carnival_id"):
        carnival = await db.wath_carnivals.find_one({"id": app_doc["carnival_id"]}, {"_id": 0})
    if app_doc.get("scholarship_id") and not carnival:
        campaign = await db.scholarships.find_one({"id": app_doc["scholarship_id"]}, {"_id": 0})
    if not carnival and not campaign:
        campaign = await db.scholarships.find_one({"active": True}, {"_id": 0}, sort=[("created_at", -1)])

    venue_name = _sanitize_venue(app_doc.get("venue") or (campaign or {}).get("venue") or app_doc.get("city"))
    if carnival:
        title = carnival.get("title") or "WATH Carnival"
        exam_date = app_doc.get("chosen_date") or (carnival.get("exam_dates") or [{}])[0].get("date", "TBA")
        exam_time = app_doc.get("chosen_slot_time") or "10:00 AM"
    else:
        title = (campaign or {}).get("title") or app_doc.get("scholarship_title", "Scholarship Test")
        exam_date = (campaign or {}).get("exam_date", "TBA")
        exam_time = (campaign or {}).get("exam_time", "10:00 AM")

    pdf_bytes = admit_card_pdf(
        application_no=application_no,
        name=app_doc.get("name", ""),
        phone=app_doc.get("phone", ""),
        school=app_doc.get("school", ""),
        standard=app_doc.get("standard", ""),
        target_exam=app_doc.get("target_exam", ""),
        exam_date=exam_date,
        venue=venue_name,
        exam_time=exam_time,
        scholarship_title=title,
        father_name=app_doc.get("father_name"),
        gender=app_doc.get("gender"),
        dob=app_doc.get("dob"),
        email=app_doc.get("email"),
        address=app_doc.get("address"),
        district=app_doc.get("district"),
    )
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="admit-card-{application_no}.pdf"'})

# ---------- Scholarship result card PDF ----------
@router.get("/scholarship-applications/{application_no}/result-card")
async def result_card(application_no: str, phone: Optional[str] = None):
    app_doc = await db.scholarship_applications.find_one({"application_no": application_no}, {"_id": 0})
    if not app_doc:
        raise HTTPException(404, "Application not found")
    if not app_doc.get("result_published"):
        raise HTTPException(403, "Result not yet published")
    if phone and app_doc.get("phone") != phone.strip():
        raise HTTPException(403, "Phone does not match application")
    campaign = None
    if app_doc.get("carnival_id"):
        car = await db.wath_carnivals.find_one({"id": app_doc["carnival_id"]}, {"_id": 0})
        if car:
            campaign = {"title": car.get("title") or "WATH Carnival"}
    if not campaign and app_doc.get("scholarship_id"):
        campaign = await db.scholarships.find_one({"id": app_doc["scholarship_id"]}, {"_id": 0})
    pdf_bytes = result_card_pdf(
        application_no=application_no,
        name=app_doc.get("name", ""),
        school=app_doc.get("school", ""),
        standard=app_doc.get("standard", ""),
        target_exam=app_doc.get("target_exam", ""),
        marks_obtained=app_doc.get("result_marks_obtained", 0),
        total_marks=app_doc.get("result_total_marks", 100),
        rank=app_doc.get("result_rank"),
        percentile=app_doc.get("result_percentile"),
        scholarship_percentage=app_doc.get("result_scholarship_percentage", 0),
        remarks=app_doc.get("result_remarks"),
        scholarship_title=(campaign or {}).get("title") or app_doc.get("scholarship_title", "Scholarship Test"),
    )
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="result-{application_no}.pdf"'})

@router.get("/admin/export/{kind}")
async def export(kind: str, _admin = Depends(require_admin)):
    mapping = {
        "enrollments": ("enrollments", "Enrollments"),
        "scholarship-applications": ("scholarship_applications", "Scholarships"),
        "job-applications": ("job_applications", "Jobs"),
        "inquiries": ("inquiries", "Inquiries"),
        "students": ("users", "Students"),
    }
    if kind not in mapping:
        raise HTTPException(404, "Unknown export kind")
    coll, name = mapping[kind]
    q = {"role": "student"} if kind == "students" else {}
    rows = await db[coll].find(q, {"_id": 0, "password_hash": 0}).to_list(None)
    return export_excel(rows, name, f"{kind}.xlsx")

