import io
import os
from datetime import datetime, timedelta
from typing import Any

from core.database import db
from core.security import *
from core.utils import *
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from models.schemas import *

router = APIRouter()

# ============================================================================
# WhatsApp Broadcasting System Routes
# ============================================================================

@router.get("/whatsapp/templates")
async def wa_list_templates(_admin = Depends(require_admin)):
    token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
    waba_id = os.environ.get("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
    if not token or not waba_id:
        raise HTTPException(500, "WhatsApp credentials not configured on server")
    try:
        templates = await fetch_approved_templates(token, waba_id)
        return {"data": templates}
    except Exception as e:
        logging.error(f"Failed to fetch templates: {e}")
        raise HTTPException(502, f"Meta API error: {e}")


@router.post("/whatsapp/templates/parse")
async def wa_parse_template(payload: dict[str, Any], _admin = Depends(require_admin)):
    template_name = payload.get("template_name", "")
    template_components = payload.get("template_components") or []
    if not template_name and not template_components:
        raise HTTPException(400, "template_name or template_components is required")
    if template_components:
        variables = parse_template_variables(template_components)
    else:
        token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
        waba_id = os.environ.get("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
        if not token or not waba_id:
            raise HTTPException(500, "WhatsApp credentials not configured")
        templates = await fetch_approved_templates(token, waba_id)
        match = next((t for t in templates if t.get("name") == template_name), None)
        if not match:
            raise HTTPException(404, f"Template {template_name} not found or not approved")
        variables = parse_template_variables(match.get("components") or [])
    return {"variables": variables}


@router.post("/whatsapp/upload-contacts")
async def wa_upload_contacts(
    file: UploadFile = File(...),
    campaign_id: str | None = Form(None),
    _admin = Depends(require_admin),
):
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(400, "Only .xlsx, .xls, or .csv files are allowed")
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(400, "File size must be under 10MB")
    try:
        result = parse_excel_contacts(contents)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to parse file: {e}")

    job_id = new_id()
    await db.bulk_jobs.insert_one({
        "id": job_id,
        "type": "wa_contact_upload",
        "campaign_id": campaign_id,
        "status": "completed",
        "total_rows": result.total_rows,
        "processed": len(result.contacts),
        "success": len(result.contacts),
        "errors": result.skipped_invalid + result.skipped_duplicates,
        "recent_logs": [*result.warnings[-15:], f"Parsed {len(result.contacts)} contacts, {result.skipped_duplicates} duplicates skipped, {result.skipped_invalid} invalid rows"],
        "created_at": now_iso(),
    })

    # Store contacts in wa_broadcast_contacts
    for contact in result.contacts:
        contact["id"] = new_id()
        contact["upload_job_id"] = job_id
        contact["campaign_id"] = campaign_id
        contact["created_at"] = now_iso()
        await db.wa_broadcast_contacts.insert_one(contact)

    return {
        "job_id": job_id,
        "total_rows": result.total_rows,
        "contacts_imported": len(result.contacts),
        "warnings": result.warnings,
        "skipped_duplicates": result.skipped_duplicates,
        "skipped_invalid": result.skipped_invalid,
    }


@router.post("/whatsapp/campaigns")
async def wa_create_campaign(payload: dict[str, Any], _admin = Depends(require_admin)):
    template_name = payload.get("template_name", "")
    template_language = payload.get("template_language", "en_US")
    template_components = payload.get("template_components") or []
    target_group = payload.get("target_group", "all")
    branch_id = payload.get("branch_id")
    variable_defaults = payload.get("variable_defaults") or {}
    variable_mappings = payload.get("variable_mappings") or {}
    external_contact_job_id = payload.get("external_contact_job_id")
    name = payload.get("name", template_name)

    if not template_name and not template_components:
        raise HTTPException(400, "template_name or template_components is required")

    # Validate template exists and is approved if using name lookup
    if template_name and not template_components:
        token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
        waba_id = os.environ.get("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
        if token and waba_id:
            templates = await fetch_approved_templates(token, waba_id)
            match = next((t for t in templates if t.get("name") == template_name), None)
            if not match:
                raise HTTPException(400, f"Template {template_name} is not approved or does not exist")
            template_components = match.get("components") or []
            template_language = match.get("language", template_language)

    campaign_id = new_id()
    doc = {
        "id": campaign_id,
        "name": name,
        "template_name": template_name,
        "template_language": template_language,
        "template_components": template_components,
        "variable_defaults": variable_defaults,
        "variable_mappings": variable_mappings,
        "target_group": target_group,
        "branch_id": branch_id,
        "external_contact_job_id": external_contact_job_id,
        "total_recipients": 0,
        "status": "draft",
        "created_by": _admin.get("id"),
        "created_at": now_iso(),
        "completed_at": None,
    }
    await db.wa_campaigns.insert_one(doc)
    return {"campaign_id": campaign_id}


@router.post("/whatsapp/campaigns/{campaign_id}/send")
async def wa_send_campaign(campaign_id: str, background: BackgroundTasks, _admin = Depends(require_admin)):
    campaign = await db.wa_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    if campaign.get("status") == "processing":
        raise HTTPException(400, "Campaign is already processing")

    job_id = new_id()
    await db.bulk_jobs.insert_one({
        "id": job_id,
        "type": "whatsapp_broadcast",
        "campaign_id": campaign_id,
        "status": "initializing",
        "total_rows": 0,
        "processed": 0,
        "success": 0,
        "errors": 0,
        "recent_logs": [f"Broadcast job created for campaign {campaign_id}"],
        "created_at": now_iso(),
    })

    await db.wa_campaigns.update_one({"id": campaign_id}, {"$set": {"status": "processing"}})

    background.add_task(run_broadcast_job, campaign_id, job_id)

    return {"job_id": job_id, "status": "accepted", "campaign_id": campaign_id}


@router.get("/whatsapp/campaigns")
async def wa_list_campaigns(_admin = Depends(require_admin)):
    return await db.wa_campaigns.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)


@router.get("/whatsapp/campaigns/{campaign_id}")
async def wa_get_campaign(campaign_id: str, _admin = Depends(require_admin)):
    campaign = await db.wa_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    # Find latest bulk job
    job = await db.bulk_jobs.find_one(
        {"type": "whatsapp_broadcast", "campaign_id": campaign_id},
        {"_id": 0},
    )
    return {**campaign, "latest_job": job}


@router.get("/whatsapp/campaigns/{campaign_id}/analytics")
async def wa_campaign_analytics(campaign_id: str, _admin = Depends(require_admin)):
    campaign = await db.wa_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    cursor = db.wa_broadcast_analytics.find({"campaign_id": campaign_id}, {"_id": 0}).to_list(None)
    messages = await cursor

    total = len(messages)
    by_status: dict[str, int] = {}
    for m in messages:
        s = m.get("status", "unknown")
        by_status[s] = by_status.get(s, 0) + 1

    delivered = by_status.get("delivered", 0) + by_status.get("read", 0)
    read = by_status.get("read", 0)
    failed = by_status.get("failed", 0)
    delivery_rate = (delivered / total * 100) if total else 0
    read_rate = (read / total * 100) if total else 0
    fail_rate = (failed / total * 100) if total else 0

    cost = await calculate_campaign_cost(campaign_id)

    return {
        "campaign_id": campaign_id,
        "total_messages": total,
        "by_status": by_status,
        "delivery_rate": round(delivery_rate, 2),
        "read_rate": round(read_rate, 2),
        "fail_rate": round(fail_rate, 2),
        "cost": cost,
    }


@router.get("/whatsapp/analytics/stream")
async def wa_analytics_stream(campaign_id: str, request: Request, _admin = Depends(require_admin)):
    campaign = await db.wa_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    generator = await broadcast_analytics_stream(campaign_id, request)
    return StreamingResponse(generator, media_type="text/event-stream")


@router.get("/whatsapp/costs")
async def wa_cost_report(month: str | None = Query(None), _admin = Depends(require_admin)):
    query: dict[str, Any] = {}
    if month:
        try:
            start = datetime.fromisoformat(f"{month}-01T00:00:00+00:00")
            end = (start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            query["sent_at"] = {"$gte": start.isoformat(), "$lte": end.isoformat()}
        except Exception:
            raise HTTPException(400, "Invalid month format. Use YYYY-MM")
    cursor = db.wa_broadcast_analytics.find(query, {"_id": 0}).to_list(None)
    messages = await cursor
    total = sum(get_message_cost("IN", m.get("pricing_category") or "marketing") for m in messages)
    by_category: dict[str, float] = {}
    for m in messages:
        cat = (m.get("pricing_category") or "marketing").lower()
        by_category[cat] = by_category.get(cat, 0.0) + get_message_cost("IN", cat)
    return {
        "month": month,
        "total_messages": len(messages),
        "total_cost_usd": round(total, 4),
        "by_category": {k: round(v, 4) for k, v in by_category.items()},
    }


# ============================================================================
# WhatsApp Quick Replies
# ============================================================================

@router.get("/whatsapp/quick-replies")
async def wa_list_quick_replies(category: str | None = None, _admin = Depends(require_admin)):
    q: dict[str, Any] = {}
    if category:
        q["category"] = category
    return await db.wa_quick_replies.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@router.post("/whatsapp/quick-replies")
async def wa_create_quick_reply(payload: dict[str, Any], _admin = Depends(require_admin)):
    doc = {
        "id": new_id(),
        "shortcut": payload.get("shortcut", ""),
        "text": payload.get("text", ""),
        "category": payload.get("category", "general"),
        "created_by": _admin.get("id"),
        "created_at": now_iso(),
    }
    await db.wa_quick_replies.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/whatsapp/quick-replies/{qr_id}")
async def wa_update_quick_reply(qr_id: str, payload: dict[str, Any], _admin = Depends(require_admin)):
    await db.wa_quick_replies.update_one({"id": qr_id}, {"$set": payload})
    doc = await db.wa_quick_replies.find_one({"id": qr_id}, {"_id": 0})
    return doc or {}


@router.delete("/whatsapp/quick-replies/{qr_id}")
async def wa_delete_quick_reply(qr_id: str, _admin = Depends(require_admin)):
    await db.wa_quick_replies.update_one({"id": qr_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}


# ============================================================================
# WhatsApp Template Preview / Sandbox
# ============================================================================

@router.post("/whatsapp/templates/{template_name}/preview")
async def wa_preview_template(template_name: str, payload: dict[str, Any], _admin = Depends(require_admin)):
    token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
    phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
    if not token or not phone_id:
        raise HTTPException(500, "WhatsApp credentials not configured")
    target = payload.get("to") or _admin.get("phone") or _admin.get("email")
    if not target:
        raise HTTPException(400, "No recipient phone provided and admin profile has no phone")
    language = payload.get("language", "en_US")
    components = payload.get("components") or []
    if not components:
        waba_id = os.environ.get("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
        if not waba_id:
            raise HTTPException(500, "WhatsApp credentials not configured")
        templates = await fetch_approved_templates(token, waba_id)
        match = next((t for t in templates if t.get("name") == template_name), None)
        if not match:
            raise HTTPException(404, f"Template {template_name} not found or not approved")
        components = match.get("components") or []
        language = match.get("language", language)
    variables = parse_template_variables(components)
    sample_vars = []
    for v in variables:
        idx = v["index"]
        sample_vars.append({"type": "text", "text": payload.get(f"var_{idx}") or f"sample_{idx}"})
    result = await send_broadcast_template(
        wa_id=target,
        template_name=template_name,
        language=language,
        components=components,
        variables=sample_vars,
        access_token=token,
        phone_id=phone_id,
    )
    if not result.get("ok"):
        raise HTTPException(502, result.get("error", "Failed to send preview"))
    return {"ok": True, "wa_message_id": result.get("wa_message_id")}


# ============================================================================
# Excel Template Download
# ============================================================================

@router.get("/whatsapp/upload-template")
async def wa_download_upload_template(_admin = Depends(require_admin)):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "contacts"
    ws.append(["phone", "name", "email", "city", "course", "var_1", "var_2"])
    ws.append(["919876543210", "John Doe", "john@example.com", "Srinagar", "NEET", "A", "2025-01-01"])
    ws.append(["919876543211", "Jane Smith", "jane@example.com", "Jammu", "IIT-JEE", "B", "2025-01-02"])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=wa_upload_template.xlsx"},
    )




_default_allowed = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://nexed-neet.preview.emergentagent.com",
    "https://northendedu.com",
    "https://www.northendedu.com",
    "https://nexed-neet.emergent.host",
]
_cors_env = os.environ.get("CORS_ORIGINS", "")
if _cors_env:
    _default_allowed.extend([o.strip() for o in _cors_env.split(",") if o.strip()])
_extra = os.environ.get("ADDITIONAL_ORIGINS", "")
if _extra:
    _default_allowed.extend([o.strip() for o in _extra.split(",") if o.strip()])
_frontend_url = os.environ.get("FRONTEND_URL", "")
if _frontend_url:
    _default_allowed.append(_frontend_url.strip())

_allowed_origins = list({origin.rstrip("/") for origin in _default_allowed if origin})

