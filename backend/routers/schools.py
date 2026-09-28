import io
from datetime import datetime, timezone
from typing import Any

from core.database import db
from core.security import *
from core.utils import *
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Response,
    UploadFile,
)
from models.schemas import *

router = APIRouter()

# ---------- School helpers ----------

def _parse_school_excel(file_bytes: bytes) -> list[dict]:
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes))
    ws = wb.active
    headers = [str((c.value or "").strip()).lower() for c in ws[1]]
    required = {"name", "mobile", "current class", "course"}
    missing = required - set(headers)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(sorted(missing))}")
    name_idx = headers.index("name")
    mobile_idx = headers.index("mobile")
    class_idx = headers.index("current class")
    course_idx = headers.index("course")
    ALLOWED_CLASSES = {"7th class", "8th class", "9th class", "10th class", "11th class", "12th class"}
    ALLOWED_COURSES = {"foundation", "neet", "iit jee"}
    rows = []
    errors = []
    for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        if all(v is None or str(v).strip() == "" for v in row):
            continue
        name = str(row[name_idx] or "").strip()
        mobile = str(row[mobile_idx] or "").strip()
        cur_class = str(row[class_idx] or "").strip().lower()
        course = str(row[course_idx] or "").strip().lower()
        if not name or not mobile or not cur_class or not course:
            errors.append(f"Row {i}: missing required values")
            continue
        if cur_class not in ALLOWED_CLASSES:
            errors.append(f"Row {i}: invalid class '{row[class_idx]}'")
            continue
        if course not in ALLOWED_COURSES:
            errors.append(f"Row {i}: invalid course '{row[course_idx]}'")
            continue
        rows.append({
            "name": name,
            "mobile": mobile,
            "current_class": cur_class.title(),
            "course": course.title() if course != "iit jee" else "IIT JEE",
        })
    return rows, errors

# ---------- School routes ----------

@router.post("/school/register")
async def school_register(payload: RegisterIn, response: Response):
    if not payload.school_name:
        raise HTTPException(400, "school_name is required for school registration")
    return await register(payload, response)

async def _get_school_visit_or_404(visit_id: str):
    visit = await db.school_visits.find_one({"id": visit_id}, {"_id": 0})
    if not visit:
        raise HTTPException(404, "Visit request not found")
    return visit

@router.post("/school/upload-students")
async def school_upload_students(
    scholarship_id: str = Form(...),
    file: UploadFile = File(...),
    school: dict = Depends(require_school),
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(400, "Only .xlsx files are allowed")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "File size must be under 5MB")
    try:
        rows, parse_errors = _parse_school_excel(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to parse Excel: {e}")
    if len(rows) > 500:
        raise HTTPException(400, "Maximum 500 student rows allowed per upload")
    campaign = await db.scholarships.find_one({"id": scholarship_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Scholarship campaign not found")
    if not campaign.get("active"):
        raise HTTPException(400, "Scholarship campaign is closed")
    created = 0
    skipped = 0
    for row in rows:
        dup_query = {"$or": [{"email": row["mobile"] + "@school.local"}, {"phone": row["mobile"]}]}
        dup_query["scholarship_id"] = scholarship_id
        existing = await db.scholarship_applications.find_one(dup_query)
        if existing:
            skipped += 1
            continue
        student_doc = {
            "id": new_id(),
            "name": row["name"],
            "email": f"{row['mobile']}@school.local",
            "phone": row["mobile"],
            "school": school.get("school_name") or school.get("name") or "",
            "standard": row["current_class"],
            "target_exam": row["course"],
            "city": school.get("district") or "",
            "scholarship_id": scholarship_id,
            "venue": campaign.get("available_venues", ["90 FT"])[0] if campaign.get("available_venues") else "90 FT",
            "address": school.get("address"),
            "district": school.get("district"),
            "source": "school",
            "school_id": school.get("id"),
            "school_name": school.get("school_name") or school.get("name") or "",
            "campaign_kind": "scholarship",
            "status": "pending",
            "scholarship_title": campaign.get("title", ""),
            "created_at": now_iso(),
        }
        for _ in range(10):
            candidate = str(random.randint(10000000, 99999999))
            if not await db.scholarship_applications.find_one({"application_no": candidate}):
                student_doc["application_no"] = candidate
                break
        else:
            student_doc["application_no"] = str(int(datetime.now(timezone.utc).timestamp() * 1000))[-8:]
        await db.scholarship_applications.insert_one(student_doc)
        created += 1
    return SchoolBulkRegisterResult(
        processed=len(rows),
        created=created,
        skipped=skipped,
        errors=parse_errors,
    ).model_dump()

@router.post("/school/visit-request")
async def school_visit_request(payload: SchoolVisitIn, school: dict = Depends(require_school)):
    try:
        pref_date = datetime.strptime(payload.preferred_date, "%Y-%m-%d").date()
        pref_time = datetime.strptime(payload.preferred_slot_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(400, "Invalid date or time format. Use YYYY-MM-DD and HH:MM")
    today = datetime.now(timezone.utc).date()
    if pref_date <= today:
        raise HTTPException(400, "Preferred date must be in the future")
    campaign = await db.scholarships.find_one({"id": payload.scholarship_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Scholarship campaign not found")
    existing = await db.school_visits.find_one({"school_id": school["id"], "scholarship_id": payload.scholarship_id})
    if existing:
        raise HTTPException(400, "You have already submitted a visit request for this campaign")
    if campaign.get("start_date") and campaign.get("end_date"):
        start = datetime.strptime(campaign["start_date"], "%Y-%m-%d").date()
        end = datetime.strptime(campaign["end_date"], "%Y-%m-%d").date()
        if not (start <= pref_date <= end):
            raise HTTPException(400, f"Preferred date must be between {campaign['start_date']} and {campaign['end_date']}")
    time_slots = campaign.get("time_slots") or []
    if time_slots:
        matched = False
        for slot in time_slots:
            if not slot.get("enabled", True):
                continue
            try:
                from_time = datetime.strptime(slot["from_time"], "%H:%M").time()
                to_time = datetime.strptime(slot["to_time"], "%H:%M").time()
                if from_time <= pref_time <= to_time:
                    matched = True
                    break
            except (ValueError, TypeError):
                continue
        if not matched:
            raise HTTPException(400, "Preferred time must fall within an enabled time slot window")
    count = await db.school_visits.count_documents({
        "preferred_date": payload.preferred_date,
        "status": {"$in": ["pending", "approved"]},
    })
    if count >= 2:
        raise HTTPException(400, "This date already has 2 schools scheduled. Please choose another date")
    visit = {
        "id": new_id(),
        "school_id": school["id"],
        "school_name": school.get("school_name") or school.get("name") or "",
        "scholarship_id": payload.scholarship_id,
        "preferred_date": payload.preferred_date,
        "preferred_slot_time": payload.preferred_slot_time,
        "status": "pending",
        "admin_notes": payload.notes or "",
        "created_at": now_iso(),
    }
    await db.school_visits.insert_one(visit)
    visit.pop("_id", None)
    return visit

@router.get("/school/my-visits")
async def school_my_visits(school: dict = Depends(require_school)):
    visits = await db.school_visits.find({"school_id": school["id"]}, {"_id": 0}).sort("created_at", -1).to_list(None)
    for v in visits:
        v.setdefault("admin_notes", "")
    return visits

@router.get("/admin/school-visits")
async def admin_list_school_visits(
    status: str | None = Query(None),
    date: str | None = Query(None),
    _admin = Depends(require_admin),
):
    q: dict[str, Any] = {}
    if status:
        q["status"] = status
    if date:
        q["preferred_date"] = date
    visits = await db.school_visits.find(q, {"_id": 0}).sort("created_at", -1).to_list(None)
    for v in visits:
        v.setdefault("admin_notes", "")
    return visits

@router.put("/admin/school-visits/{visit_id}")
async def admin_update_school_visit(
    visit_id: str,
    payload: dict[str, Any],
    _admin = Depends(require_admin),
):
    await _get_school_visit_or_404(visit_id)
    allowed_statuses = {"pending", "approved", "rejected"}
    update_fields = {}
    if "status" in payload:
        if payload["status"] not in allowed_statuses:
            raise HTTPException(400, "Invalid status")
        update_fields["status"] = payload["status"]
    if "admin_notes" in payload:
        update_fields["admin_notes"] = payload.get("admin_notes") or ""
    if not update_fields:
        raise HTTPException(400, "No updatable fields provided")
    await db.school_visits.update_one({"id": visit_id}, {"$set": update_fields})
    return await _get_school_visit_or_404(visit_id)

@router.get("/admin/school-visits/availability")
async def admin_school_visit_availability(date: str = Query(...), _admin = Depends(require_admin)):
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")
    count = await db.school_visits.count_documents({
        "preferred_date": date,
        "status": {"$in": ["pending", "approved"]},
    })
    return {"date": date, "current_count": count, "max": 2, "available": count < 2}

@router.get("/school/upload-template")
async def school_upload_template(school: dict = Depends(require_school)):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Students"
    ws.append(["Name", "Mobile", "Current Class", "Course"])
    ws.append(["Rahul Kumar", "9876543210", "10th Class", "NEET"])
    ws.append(["Ayesha Singh", "9876543211", "12th Class", "IIT JEE"])
    for col in ws.columns:
        for cell in col:
            if cell.value:
                cell.font = openpyxl.styles.Font(bold=True)
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="school_students_template.xlsx"'}
    )

@router.get("/admin/school-applications")
async def admin_list_school_applications(
    scholarship_id: str | None = Query(None),
    school_id: str | None = Query(None),
    _admin = Depends(require_admin),
):
    q: dict[str, Any] = {"source": "school"}
    if scholarship_id:
        q["scholarship_id"] = scholarship_id
    if school_id:
        q["school_id"] = school_id
    return await db.scholarship_applications.find(q, {"_id": 0}).sort("created_at", -1).to_list(None)

