from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Public stats ----------
@router.get("/stats")
async def stats():
    courses = await db.courses.count_documents({})
    students = await db.users.count_documents({"role": "student"})
    enrollments = await db.enrollments.count_documents({})
    centers = await db.centers.count_documents({})
    selections = await db.results.count_documents({})
    return {
        "students_trained": max(students * 50 + 12000, 12000),
        "selections": max(selections * 8 + 850, 850),
        "educators": 65,
        "centers": max(centers, 6),
        "courses": courses,
        "enrollments": enrollments,
    }

# ---------- Featured highlight ----------
FEATURED_COLLECTIONS = ["notices", "jobs", "scholarships"]

async def _clear_featured_except(keep_coll: str | None, keep_id: str | None):
    for coll in FEATURED_COLLECTIONS:
        q = {"is_featured": True}
        if coll == keep_coll and keep_id:
            q["id"] = {"$ne": keep_id}
        await db[coll].update_many(q, {"$set": {"is_featured": False}})

@router.get("/featured")
async def get_featured():
    for coll, kind in [("notices", "notice"), ("jobs", "job"), ("scholarships", "scholarship")]:
        doc = await db[coll].find_one({"is_featured": True}, {"_id": 0})
        if doc:
            doc["kind"] = kind
            return doc
    return None

@router.post("/admin/feature")
async def set_featured(kind: str = Query(...), item_id: str = Query(...), _admin = Depends(require_admin)):
    if kind == "clear":
        await _clear_featured_except(None, None)
        return {"ok": True, "featured": None}
    coll_map = {"notice": "notices", "job": "jobs", "scholarship": "scholarships"}
    coll = coll_map.get(kind)
    if not coll:
        raise HTTPException(400, "kind must be notice|job|scholarship|clear")
    target = await db[coll].find_one({"id": item_id})
    if not target:
        raise HTTPException(404, f"{kind} not found")
    await _clear_featured_except(coll, item_id)
    await db[coll].update_one({"id": item_id}, {"$set": {"is_featured": True}})
    return {"ok": True, "kind": kind, "id": item_id}

# ---------- Notices ----------
@router.get("/notices")
async def list_notices(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None)
):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.notices.count_documents(query)
    items = await db.notices.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.post("/notices")
async def create_notice(payload: NoticeIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.notices.insert_one(doc)
    if doc.get("is_featured"):
        await _clear_featured_except("notices", doc["id"])
    doc.pop("_id", None)
    asyncio.create_task(notify_students(
        "New Notice",
        doc.get("title", "A new notice has been published."),
        data={"type": "notice", "notice_id": doc.get("id")},
        url="/notices",
    ))
    return doc

@router.put("/notices/{nid}")
async def update_notice(nid: str, payload: NoticeIn, _admin = Depends(require_admin)):
    data = payload.model_dump()
    await db.notices.update_one({"id": nid}, {"$set": data})
    if data.get("is_featured"):
        await _clear_featured_except("notices", nid)
    return await db.notices.find_one({"id": nid}, {"_id": 0})

@router.delete("/notices/{nid}")
async def delete_notice(nid: str, _admin = Depends(require_admin)):
    await db.notices.update_one({"id": nid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------- Centers ----------
@router.get("/centers")
async def list_centers(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None)
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.centers.count_documents(query)
    items = await db.centers.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.post("/centers")
async def create_center(payload: CenterIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["slug"] = await unique_slug("centers", doc.get("name") or "center")
    doc["created_at"] = now_iso()
    await db.centers.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/centers/{cid}")
async def update_center(cid: str, payload: CenterIn, _admin = Depends(require_admin)):
    existing = await db.centers.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0})
    real_id = existing["id"] if existing else cid
    data = payload.model_dump()
    data["slug"] = await unique_slug("centers", data.get("name") or "center", exclude_id=real_id)
    await db.centers.update_one({"id": real_id}, {"$set": data})
    return await db.centers.find_one({"id": real_id}, {"_id": 0})

@router.delete("/centers/{cid}")
async def delete_center(cid: str, _admin = Depends(require_admin)):
    await db.centers.update_one({"$or": [{"id": cid}, {"slug": cid}]}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------- Results ----------
@router.get("/results")
async def list_results(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None)
):
    query = {}
    if search:
        query["$or"] = [
            {"student_name": {"$regex": search, "$options": "i"}},
            {"exam": {"$regex": search, "$options": "i"}},
            {"rank": {"$regex": search, "$options": "i"}},
            {"course": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.results.count_documents(query)
    items = await db.results.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.post("/results")
async def create_result(payload: ResultIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.results.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/results/{rid}")
async def update_result(rid: str, payload: ResultIn, _admin = Depends(require_admin)):
    await db.results.update_one({"id": rid}, {"$set": payload.model_dump()})
    return await db.results.find_one({"id": rid}, {"_id": 0})

@router.delete("/results/{rid}")
async def delete_result(rid: str, _admin = Depends(require_admin)):
    await db.results.update_one({"id": rid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------- Testimonials ----------
@router.get("/testimonials")
async def list_testimonials(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None)
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"role": {"$regex": search, "$options": "i"}},
            {"quote": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.testimonials.count_documents(query)
    items = await db.testimonials.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.post("/testimonials")
async def create_testimonial(payload: TestimonialIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/testimonials/{tid}")
async def update_testimonial(tid: str, payload: TestimonialIn, _admin = Depends(require_admin)):
    await db.testimonials.update_one({"id": tid}, {"$set": payload.model_dump()})
    return await db.testimonials.find_one({"id": tid}, {"_id": 0})

@router.delete("/testimonials/{tid}")
async def delete_testimonial(tid: str, _admin = Depends(require_admin)):
    await db.testimonials.update_one({"id": tid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------- Gallery ----------
@router.get("/gallery")
async def list_gallery():
    return await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(200)

@router.get("/admin/gallery")
async def list_admin_gallery(_admin = Depends(require_admin)):
    return await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(200)

@router.post("/admin/gallery")
async def create_gallery_item(payload: GalleryItemIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/admin/gallery/{gid}")
async def update_gallery_item(gid: str, payload: GalleryItemIn, _admin = Depends(require_admin)):
    await db.gallery.update_one({"id": gid}, {"$set": payload.model_dump()})
    return await db.gallery.find_one({"id": gid}, {"_id": 0})

@router.delete("/admin/gallery/{gid}")
async def delete_gallery_item(gid: str, _admin = Depends(require_admin)):
    await db.gallery.update_one({"id": gid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------- Blog ----------
class PostIn(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    category: Optional[str] = None
    tags: List[str] = []
    author: str = "Admin"
    featured_image_url: Optional[str] = None
    image_alt: Optional[str] = None
    og_image_url: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    status: str = "draft"
    visibility: str = "public"
    published_at: Optional[str] = None

@router.get("/posts")
async def list_posts():
    return await db.posts.find({"status": "published", "visibility": "public"}, {"_id": 0}).sort("published_at", -1).to_list(100)

@router.get("/posts/{slug}")
async def get_post(slug: str):
    post = await db.posts.find_one({"slug": slug, "status": "published", "visibility": "public"}, {"_id": 0})
    if not post:
        raise HTTPException(404, "Post not found")
    return post

@router.get("/admin/posts")
async def list_admin_posts(_admin = Depends(require_admin)):
    return await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@router.post("/admin/posts")
async def create_post(payload: PostIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    if not doc.get("published_at") and doc.get("status") == "published":
        doc["published_at"] = now_iso()
    await db.posts.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/admin/posts/{pid}")
async def update_post(pid: str, payload: PostIn, _admin = Depends(require_admin)):
    await db.posts.update_one({"id": pid}, {"$set": payload.model_dump()})
    return await db.posts.find_one({"id": pid}, {"_id": 0})

@router.delete("/admin/posts/{pid}")
async def delete_post(pid: str, _admin = Depends(require_admin)):
    await db.posts.update_one({"id": pid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ---------- Contact ----------
@router.post("/contact")
async def contact(payload: ContactIn, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"contact:{client_ip}", max_requests=10, window_seconds=60)
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["status"] = "new"
    await db.inquiries.insert_one(doc)
    asyncio.create_task(notify_admins(
        "New Inquiry Received",
        f"{doc.get('name', 'Someone')} sent a new query: {doc.get('subject', 'No subject')}",
        data={"type": "inquiry", "inquiry_id": doc.get("id")},
        url="/admin",
    ))
    doc.pop("_id", None)
    return doc

@router.get("/inquiries")
async def list_inquiries(_admin = Depends(require_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@router.post("/admin/push-notifications")
async def send_push_notification(payload: PushNotificationIn, _admin = Depends(require_admin)):
    # Legacy OneSignal fallback removed - replacing with new Firebase FCM
    # Currently only admin targeting is supported natively via FCM
    await send_super_admin_notification(
        title=payload.title,
        body=payload.message,
        target_path=payload.url or ""
    )
    return {"ok": True, "result": "Sent via Firebase FCM"}

# ---------- Admin Dashboard summary ----------


@router.get("/admin/crm/search")
async def crm_search(q: str = Query(...), _admin = Depends(require_admin)):
    regex = {"$regex": q, "$options": "i"}
    query = {"$or": [{"name": regex}, {"email": regex}, {"phone": regex}], "is_deleted": {"$ne": True}}

    # Search across collections
    enrollments = await db.enrollments.find(query, {"_id": 0}).to_list(100)
    scholarships = await db.scholarship_applications.find(query, {"_id": 0}).to_list(100)
    inquiries = await db.inquiries.find(query, {"_id": 0}).to_list(100)
    jobs = await db.job_applications.find(query, {"_id": 0}).to_list(100)

    # Hydrate course names for enrollments
    course_ids = list({e.get("course_id") for e in enrollments if e.get("course_id")})
    if course_ids:
        c_map = {}
        async for c in db.courses.find({"$or": [{"id": {"$in": course_ids}}, {"slug": {"$in": course_ids}}]}, {"id": 1, "slug": 1, "title": 1}):
            title = c.get("title") or c.get("name") or c["id"]
            c_map[c["id"]] = title
            if c.get("slug"):
                c_map[c["slug"]] = title
        for e in enrollments:
            cid = e.get("course_id")
            if cid:
                e["course_title"] = c_map.get(cid, cid)
                e["course_name"] = e["course_title"]

    # Hydrate scholarship/campaign names
    sch_ids = list({s.get("scholarship_id") for s in scholarships if s.get("scholarship_id")})
    if sch_ids:
        s_map = {}
        async for sc in db.scholarships.find({"$or": [{"id": {"$in": sch_ids}}, {"slug": {"$in": sch_ids}}]}, {"id": 1, "slug": 1, "title": 1}):
            title = sc.get("title") or sc.get("name") or sc["id"]
            s_map[sc["id"]] = title
            if sc.get("slug"):
                s_map[sc["slug"]] = title
        for s in scholarships:
            sid = s.get("scholarship_id")
            if sid:
                s["scholarship_title"] = s_map.get(sid, sid)
                s["campaign_title"] = s["scholarship_title"]

    # Hydrate job titles
    job_ids = list({j.get("job_id") for j in jobs if j.get("job_id")})
    if job_ids:
        j_map = {jb["id"]: jb.get("title", jb["id"]) async for jb in db.jobs.find({"id": {"$in": job_ids}}, {"id": 1, "title": 1})}
        for j in jobs:
            jid = j.get("job_id")
            if jid:
                j["job_title"] = j_map.get(jid, jid)

    # Compile a unified list of unique people based on email or phone
    people_map = {}

    def add_person(record, source_type):
        key = record.get("email") or record.get("phone") or record.get("name")
        if not key: return
        key = key.lower().strip()
        
        if key not in people_map:
            people_map[key] = {
                "name": record.get("name"),
                "email": record.get("email"),
                "phone": record.get("phone"),
                "history": []
            }
            
        people_map[key]["history"].append({
            "type": source_type,
            "date": record.get("created_at"),
            "details": record
        })

    for e in enrollments: add_person(e, "Enrollment")
    for s in scholarships: add_person(s, "Scholarship App")
    for i in inquiries: add_person(i, "Inquiry")
    for j in jobs: add_person(j, "Job App")

    # Sort history by date descending
    for person in people_map.values():
        person["history"].sort(key=lambda x: x["date"] or "", reverse=True)

    return {"results": list(people_map.values())}


@router.get("/admin/calendar")
async def get_calendar_events(_admin = Depends(require_admin)):
    events = []
    
    # 1. Scholarships (Deadlines and Exam Dates)
    scholarships = await db.scholarships.find({"is_deleted": {"$ne": True}}).to_list(None)
    for s in scholarships:
        if s.get("deadline"):
            events.append({
                "id": f"sch-dl-{s['id']}",
                "title": f"Deadline: {s.get('title')}",
                "date": s.get("deadline"),
                "type": "deadline",
                "link": f"/admin/campaigns/{s['id']}/edit"
            })
        if s.get("exam_date"):
            events.append({
                "id": f"sch-ex-{s['id']}",
                "title": f"Exam: {s.get('title')} {s.get('exam_time', '')}",
                "date": s.get("exam_date"),
                "type": "exam",
                "link": f"/admin/campaigns/{s['id']}/edit"
            })
            
    # 2. Notices
    notices = await db.notices.find({"is_deleted": {"$ne": True}}).to_list(None)
    for n in notices:
        if n.get("date"):
            events.append({
                "id": f"not-{n['id']}",
                "title": f"Notice: {n.get('title')}",
                "date": n.get("date"),
                "type": "notice",
                "link": "/admin/notices"
            })
            
    # 3. Blog Posts
    posts = await db.posts.find({"is_deleted": {"$ne": True}}).to_list(None)
    for p in posts:
        if p.get("published_at"):
            events.append({
                "id": f"post-{p['id']}",
                "title": f"Published: {p.get('title')}",
                "date": p.get("published_at").split('T')[0] if 'T' in p.get("published_at") else p.get("published_at"),
                "type": "post",
                "link": "/admin/blog"
            })

    return {"events": events}

@router.get("/admin/analytics")
async def get_admin_analytics(_admin = Depends(require_admin)):
    # 1. Enrollment Trends (last 6 months approximation by taking all and grouping by YYYY-MM)
    enrollment_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$project": {"month": {"$substr": ["$created_at", 0, 7]}}},
        {"$group": {"_id": "$month", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 12}
    ]
    enrollment_data = await db.enrollments.aggregate(enrollment_pipeline).to_list(None)
    
    # 2. Scholarship Trends
    scholarship_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$project": {"month": {"$substr": ["$created_at", 0, 7]}}},
        {"$group": {"_id": "$month", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 12}
    ]
    scholarship_data = await db.scholarship_applications.aggregate(scholarship_pipeline).to_list(None)

    # 3. Top Courses
    courses_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {"_id": "$course_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_courses_data = await db.enrollments.aggregate(courses_pipeline).to_list(None)

    course_ids = [d["_id"] for d in top_courses_data if d.get("_id")]
    courses_map = {}
    if course_ids:
        async for c in db.courses.find({"$or": [{"id": {"$in": course_ids}}, {"slug": {"$in": course_ids}}]}, {"id": 1, "slug": 1, "title": 1}):
            title = c.get("title") or c.get("name") or c["id"]
            courses_map[c["id"]] = title
            if c.get("slug"):
                courses_map[c["slug"]] = title

    top_courses_formatted = [
        {
            "course_id": d["_id"],
            "course_name": courses_map.get(d["_id"], d["_id"]),
            "count": d["count"]
        }
        for d in top_courses_data if d.get("_id")
    ]

    # 4. Scholarship Status Distribution
    status_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_data = await db.scholarship_applications.aggregate(status_pipeline).to_list(None)

    return {
        "enrollments_by_month": [{"month": d["_id"], "count": d["count"]} for d in enrollment_data if d["_id"]],
        "scholarships_by_month": [{"month": d["_id"], "count": d["count"]} for d in scholarship_data if d["_id"]],
        "top_courses": top_courses_formatted,
        "scholarship_statuses": [{"status": d["_id"] or "pending", "count": d["count"]} for d in status_data]
    }

import asyncio


from pydantic import BaseModel
class FcmTokenIn(BaseModel):
    token: str

@router.post("/admin/fcm-token")
async def update_fcm_token(payload: FcmTokenIn, _admin = Depends(require_admin)):
    # Upsert the FCM token for the admin
    await db.admin_devices.update_one(
        {"admin_id": _admin.get("id")},
        {"$set": {"push_token": payload.token, "platform": "web", "updated_at": now_iso()}},
        upsert=True
    )
    return {"ok": True}

@router.get("/admin/summary")
async def admin_summary(_admin = Depends(require_admin)):
    results = await asyncio.gather(
        db.users.count_documents({"role": "student"}),
        db.courses.count_documents({}),
        db.enrollments.count_documents({}),
        db.enrollments.count_documents({"status": "pending"}),
        db.scholarship_applications.count_documents({}),
        db.job_applications.count_documents({}),
        db.inquiries.count_documents({}),
        db.jobs.count_documents({}),
    )
    return {
        "total_students": results[0],
        "total_courses": results[1],
        "total_enrollments": results[2],
        "pending_enrollments": results[3],
        "total_scholarship_apps": results[4],
        "total_job_apps": results[5],
        "total_inquiries": results[6],
        "total_jobs": results[7],
    }

# ---------- File Upload & Download ----------
@router.post("/upload")
async def upload(request: Request, file: UploadFile = File(...)):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"upload:{client_ip}", max_requests=20, window_seconds=60)
    ctype = file.content_type or "application/octet-stream"
    if ctype not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(415, f"Unsupported type {ctype}. Allowed: pdf, jpg, png, webp, mp4, webm, mov.")
    ext = ALLOWED_UPLOAD_TYPES[ctype]
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File too large (max 50 MB)")
    if len(data) == 0:
        raise HTTPException(400, "Empty file")
    file_id = new_id()
    path = f"{APP_NAME}/uploads/{file_id}.{ext}"
    try:
        result = await put_object(path, data, ctype)
    except RuntimeError as e:
        msg = str(e)
        if "not initialised" in msg.lower():
            raise HTTPException(500, "File upload is currently unavailable because object storage is not configured on the server. Please contact the administrator.")
        raise HTTPException(500, f"Upload failed: {e}")
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {e}")
    record = {
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": ctype,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": now_iso(),
    }
    await db.files.insert_one(record)
    record.pop("_id", None)
    record["url"] = f"/api/files/{file_id}"
    return record

@router.get("/files/{file_id}")
async def get_file(file_id: str):
    record = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(404, "File not found")
    try:
        data, ctype = await get_object(record["storage_path"])
        filename = record.get("original_filename", f"{file_id}.bin")
        return Response(
            content=data,
            media_type=ctype,
            headers={"Content-Disposition": f'inline; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(404, f"File retrieval failed: {e}")

