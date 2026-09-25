from fastapi import APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import os, io, json, re, asyncio, uuid
from datetime import datetime, timezone, timedelta
from models.schemas import *
from core.database import db
from core.security import *
from core.utils import *

router = APIRouter()

# ---------- Courses ----------
@router.get("/courses")
async def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: str = Query(None),
    category: Optional[str] = None,
    featured: Optional[bool] = None
):
    query = {}
    if category: query["category"] = category
    if featured is not None: query["featured"] = featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    query["is_deleted"] = {"$ne": True}
    total = await db.courses.count_documents(query)
    items = await db.courses.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return {"items": items, "total": total, "page": (skip // limit) + 1, "pages": (total + limit - 1) // limit}

@router.get("/courses/{cid}")
async def get_course(cid: str):
    c = await db.courses.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0})
    if not c: raise HTTPException(404, "Course not found")
    return c

@router.post("/courses")
async def create_course(payload: CourseIn, _admin = Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["slug"] = await unique_slug("courses", doc["title"])
    doc["created_at"] = now_iso()
    await db.courses.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/courses/{cid}")
async def update_course(cid: str, payload: CourseIn, _admin = Depends(require_admin)):
    data = payload.model_dump()
    existing = await db.courses.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0})
    real_id = existing["id"] if existing else cid
    data["slug"] = await unique_slug("courses", data["title"], exclude_id=real_id)
    res = await db.courses.update_one({"id": real_id}, {"$set": data})
    if not res.matched_count: raise HTTPException(404, "Course not found")
    return await db.courses.find_one({"id": real_id}, {"_id": 0})

@router.delete("/courses/{cid}")
async def delete_course(cid: str, _admin = Depends(require_admin)):
    await db.courses.update_one({"$or": [{"id": cid}, {"slug": cid}]}, {"$set": {"is_deleted": True}})
    return {"ok": True}

