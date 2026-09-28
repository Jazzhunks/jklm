import uuid, hashlib, re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

PAGE_CONFIG_KEY = "wath_page_config"

class WathSlot(BaseModel):
    time: str
    capacity: int = Field(ge=1)
    is_open: bool = True

class WathExamDate(BaseModel):
    date: str
    slots: List[WathSlot]

class WathCarnivalIn(BaseModel):
    title: str; subtitle: Optional[str] = None; description: Optional[str] = None
    start_date: str; end_date: str; exam_dates: List[WathExamDate] = []
    banner_url: Optional[str] = None; active: bool = True

class WathPageConfigIn(BaseModel):
    mode: str = Field(pattern="^(exam|carnival|disabled)$")
    active_carnival_id: Optional[str] = None
    disabled_message: Optional[str] = None

def build_wath_router(db, require_admin_dep) -> APIRouter:
    r = APIRouter()
    iso = lambda: datetime.now(timezone.utc).isoformat()
    nid = lambda: str(uuid.uuid4())

    async def get_cfg():
        return await db.system_meta.find_one({"key": PAGE_CONFIG_KEY}, {"_id": 0}) or {"key": PAGE_CONFIG_KEY, "mode": "exam", "active_carnival_id": None, "disabled_message": None}

    async def hydrate(car, pad=False):
        counts = {f"{c['date']}|{c['time']}": c["booked_count"] for c in await db.wath_slot_counts.find({"carnival_id": car["id"]}, {"_id": 0}).to_list(500)}
        for d in car.get("exam_dates", []):
            for s in d.get("slots", []):
                cap = int(s.get("capacity", 0))
                rb = int(counts.get(f"{d['date']}|{s['time']}", 0))
                s["available"] = bool(s.get("is_open", True)) and cap - rb > 0
                if pad and cap > 0:
                    if not s["available"]: s["booked_count"], s["remaining"] = cap, 0
                    else:
                        h = int(hashlib.md5(f"{car['id']}|{d['date']}|{s['time']}".encode()).hexdigest(), 16)
                        pb = min(max(rb, round(cap * (0.50 + (h % 21) / 100.0))), cap - 1)
                        s["booked_count"], s["remaining"] = pb, max(0, cap - pb)
                else: s["booked_count"], s["remaining"] = rb, max(0, cap - rb)
        return car

    async def get_exam():
        return await db.scholarships.find_one({"kind": "wath", "active": True}, {"_id": 0}, sort=[("created_at", -1)]) or \
               await db.scholarships.find_one({"title": {"$regex": "WATH", "$options": "i"}, "active": True}, {"_id": 0}, sort=[("created_at", -1)])

    @r.get("/wath/page")
    async def page():
        c = await get_cfg(); mode = c.get("mode", "exam")
        p = {"mode": mode, "disabled_message": c.get("disabled_message")}
        if mode == "carnival":
            car = await db.wath_carnivals.find_one({"id": c.get("active_carnival_id")}, {"_id": 0}) if c.get("active_carnival_id") else \
                  await db.wath_carnivals.find_one({"active": True}, {"_id": 0}, sort=[("created_at", -1)])
            if car: p["carnival"] = await hydrate(car, True)
            else: p["mode"] = mode = "exam"
        if mode == "exam": p["exam"] = await get_exam()
        return p

    @r.get("/wath/carnivals/{cid}")
    async def get_car(cid: str):
        car = await db.wath_carnivals.find_one({"id": cid}, {"_id": 0})
        if not car: raise HTTPException(404, "Carnival not found")
        return await hydrate(car, True)

    @r.get("/admin/wath/page-config")
    async def admin_get_cfg(_=Depends(require_admin_dep)): return await get_cfg()

    @r.post("/admin/wath/page-config")
    async def admin_set_cfg(p: WathPageConfigIn, _=Depends(require_admin_dep)):
        if p.mode == "carnival" and (not p.active_carnival_id or not await db.wath_carnivals.find_one({"id": p.active_carnival_id})):
            raise HTTPException(400 if not p.active_carnival_id else 404, "Carnival not found or id missing")
        await db.system_meta.update_one({"key": PAGE_CONFIG_KEY}, {"$set": {**p.model_dump(), "key": PAGE_CONFIG_KEY, "updated_at": iso()}}, upsert=True)
        return await get_cfg()

    @r.get("/admin/wath/carnivals")
    async def admin_list(_=Depends(require_admin_dep)):
        return [await hydrate(x) for x in await db.wath_carnivals.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)]

    @r.get("/admin/wath/carnivals/{cid}")
    async def admin_get(cid: str, _=Depends(require_admin_dep)):
        car = await db.wath_carnivals.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0})
        if not car: raise HTTPException(404, "Not found")
        return await hydrate(car)

    @r.post("/admin/wath/carnivals")
    async def admin_create(p: WathCarnivalIn, _=Depends(require_admin_dep)):
        d = p.model_dump(); d["id"], d["kind"], d["created_at"] = nid(), "carnival", iso()
        d["slug"] = re.sub(r"[\s_-]+", "-", re.sub(r"[^\w\s-]", "", (d.get("title") or "carnival").lower().strip())).strip("-")
        await db.wath_carnivals.insert_one(d); d.pop("_id", None)
        return await hydrate(d)

    @r.put("/admin/wath/carnivals/{cid}")
    async def admin_update(cid: str, p: WathCarnivalIn, _=Depends(require_admin_dep)):
        ex = await db.wath_carnivals.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0})
        rid = ex["id"] if ex else cid
        d = p.model_dump(); d["updated_at"] = iso()
        d["slug"] = re.sub(r"[\s_-]+", "-", re.sub(r"[^\w\s-]", "", (d.get("title") or "carnival").lower().strip())).strip("-")
        if not (await db.wath_carnivals.update_one({"id": rid}, {"$set": d})).matched_count: raise HTTPException(404, "Not found")
        return await hydrate(await db.wath_carnivals.find_one({"id": rid}, {"_id": 0}))

    @r.delete("/admin/wath/carnivals/{cid}")
    async def admin_del(cid: str, _=Depends(require_admin_dep)):
        rid = (await db.wath_carnivals.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0}) or {}).get("id", cid)
        if (await get_cfg()).get("active_carnival_id") in (cid, rid):
            await db.system_meta.update_one({"key": PAGE_CONFIG_KEY}, {"$set": {"active_carnival_id": None, "mode": "exam"}})
        await db.wath_carnivals.delete_one({"id": rid})
        await db.wath_slot_counts.delete_many({"carnival_id": rid})
        return {"ok": True}

    @r.get("/admin/wath/carnivals/{cid}/registrations")
    async def admin_regs(cid: str, _=Depends(require_admin_dep)):
        rid = (await db.wath_carnivals.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0}) or {}).get("id", cid)
        return await db.scholarship_applications.find({"$or": [{"carnival_id": cid}, {"carnival_id": rid}]}, {"_id": 0}).sort("created_at", -1).to_list(2000)

    @r.get("/admin/wath/carnivals/{cid}/registrations/export")
    async def admin_export(cid: str, _=Depends(require_admin_dep)):
        import io as _io, openpyxl
        ex = await db.wath_carnivals.find_one({"$or": [{"id": cid}, {"slug": cid}]}, {"_id": 0}) or {}
        regs = await db.scholarship_applications.find({"$or": [{"carnival_id": cid}, {"carnival_id": ex.get("id", cid)}]}, {"_id": 0}).sort("created_at", 1).to_list(5000)
        cols = [("application_no", "App No"), ("name", "Name"), ("phone", "Phone"), ("standard", "Class"), ("school", "School"), ("target_exam", "Target Exam"), ("chosen_date", "Date"), ("chosen_slot_time", "Slot")]
        wb = openpyxl.Workbook(); ws = wb.active; ws.append([l for _, l in cols])
        for r in regs: ws.append([str(r.get(k, "") or "") for k, _ in cols])
        b = _io.BytesIO(); wb.save(b); b.seek(0)
        return StreamingResponse(b, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f'attachment; filename="{(ex.get("slug") or "carnival")}-regs.xlsx"'})

    return r

async def try_reserve_slot(db, cid: str, date: str, time: str) -> bool:
    car = await db.wath_carnivals.find_one({"id": cid}, {"_id": 0})
    if not car: return False
    cap = next((int(s.get("capacity", 0)) for d in car.get("exam_dates", []) if d.get("date") == date for s in d.get("slots", []) if s.get("time") == time and s.get("is_open", True)), 0)
    if cap <= 0: return False
    try: await db.wath_slot_counts.create_index([("carnival_id", 1), ("date", 1), ("time", 1)], unique=True)
    except: pass
    
    from pymongo import ReturnDocument
    from pymongo.errors import DuplicateKeyError
    inc = lambda: db.wath_slot_counts.find_one_and_update({"carnival_id": cid, "date": date, "time": time, "booked_count": {"$lt": cap}}, {"$inc": {"booked_count": 1}, "$set": {"capacity": cap}}, return_document=ReturnDocument.AFTER)
    if await inc(): return True
    try:
        await db.wath_slot_counts.insert_one({"carnival_id": cid, "date": date, "time": time, "capacity": cap, "booked_count": 1})
        return True
    except DuplicateKeyError:
        return bool(await inc())

async def release_slot(db, cid: str, date: str, time: str):
    await db.wath_slot_counts.update_one({"carnival_id": cid, "date": date, "time": time, "booked_count": {"$gt": 0}}, {"$inc": {"booked_count": -1}})
