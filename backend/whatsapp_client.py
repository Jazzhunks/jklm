import logging, os, httpx, uuid
from datetime import datetime, timezone

log = logging.getLogger("whatsapp")

now_iso = lambda: datetime.now(timezone.utc).isoformat()
new_id = lambda: str(uuid.uuid4())

async def _log_automated_message_to_inbox(clean_phone, wa_msg_id, preview_text, msg_type, text=None, caption=None, document_url=None, document_filename=None, linked_app_no=None, linked_title=None, linked_name=None):
    from core.database import db 
    ts = now_iso()
    patch = {"updated_at": ts}
    if linked_app_no:
        patch.update({"linked_application_no": linked_app_no, "linked_scholarship_title": linked_title, "linked_name": linked_name})

    contact = await db.wa_contacts.find_one_and_update(
        {"wa_id": clean_phone},
        {"$set": patch, "$setOnInsert": {"id": new_id(), "wa_id": clean_phone, "phone_e164": f"+{clean_phone}", "profile_name": "Applicant", "created_at": ts}},
        upsert=True, return_document=True
    )
    
    thread = await db.wa_threads.find_one_and_update(
        {"contact_id": contact["id"]},
        {"$set": {"last_message_at": ts, "last_message_preview": preview_text[:200]}, "$setOnInsert": {"id": new_id(), "wa_id": clean_phone, "unread_count": 0, "created_at": ts}},
        upsert=True, return_document=True
    )

    body_payload = {"document": {"link": document_url, "filename": document_filename}} if msg_type == "document" else ({"text": {"body": text}} if msg_type == "text" else {})
    await db.wa_messages.insert_one({
        "id": new_id(), "thread_id": thread["id"], "wa_message_id": wa_msg_id, "direction": "outbound",
        "type": msg_type, "body": body_payload, "text": text, "caption": caption, "status": "accepted", "wa_timestamp": ts, "created_at": ts
    })

async def _send_template_with_pdf(phone, template_name, pdf_bytes, filename, body_params, preview, caption, app_no, title, name):
    phone_id, access_token = os.environ.get("WHATSAPP_PHONE_NUMBER_ID"), os.environ.get("WHATSAPP_ACCESS_TOKEN")
    if not (phone_id and access_token): return False
    
    clean_phone = "".join(filter(str.isdigit, str(phone).split(".")[0]))
    if len(clean_phone) == 10: clean_phone = f"91{clean_phone}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            media_res = await client.post(f"https://graph.facebook.com/v18.0/{phone_id}/media", data={"messaging_product": "whatsapp", "type": "application/pdf"}, files={"file": (filename, pdf_bytes, "application/pdf")}, headers=headers)
            media_res.raise_for_status()
            if not (media_id := media_res.json().get("id")): return False

            payload = {
                "messaging_product": "whatsapp", "recipient_type": "individual", "to": clean_phone, "type": "template",
                "template": {
                    "name": template_name, "language": {"code": "en"},
                    "components": [
                        {"type": "header", "parameters": [{"type": "document", "document": {"id": media_id, "filename": filename}}]},
                        {"type": "body", "parameters": [{"type": "text", "text": str(p)} for p in body_params]}
                    ]
                }
            }
            msg_res = await client.post(f"https://graph.facebook.com/v18.0/{phone_id}/messages", json=payload, headers=headers)
            msg_res.raise_for_status()
            
            if wa_msg_id := (msg_res.json().get("messages") or [{}])[0].get("id"):
                await _log_automated_message_to_inbox(clean_phone, wa_msg_id, preview, "document", caption=caption, document_url=f"/api/scholarship-applications/{app_no}/admit-card", document_filename=filename, linked_app_no=app_no, linked_title=title, linked_name=name)
            return True
        except Exception as e:
            log.error(f"WhatsApp delivery failed for {clean_phone}: {e}")
            return False

async def send_whatsapp_admit_card(phone, name, application_no, scholarship_title, exam_date, venue, pdf_bytes, **kwargs):
    return await _send_template_with_pdf(
        phone, "admit_card_notification", pdf_bytes, f"AdmitCard_{application_no}.pdf",
        [name, scholarship_title, application_no, exam_date, venue],
        f"📄 [Admit Card Sent] {scholarship_title} - App No: {application_no}",
        f"*Name:* {name}\n*Campaign:* {scholarship_title}\n*App No:* {application_no}\n*Date:* {exam_date}\n*Venue:* {venue}\n",
        application_no, scholarship_title, name
    )

async def send_whatsapp_exam_notification(phone, name, scholarship_title, application_no, standard, exam_date, venue, map_url, pdf_bytes, **kwargs):
    return await _send_template_with_pdf(
        phone, "exam_details_notification", pdf_bytes, f"AdmitCard_{application_no}.pdf",
        [name, scholarship_title, application_no, standard, exam_date, venue, map_url or "N/A"],
        f"📍 [Venue Notification Sent] {venue} - {exam_date}",
        f"📍 *Venue Notification*\n\n*Name:* {name}\n*Campaign:* {scholarship_title}\n*App No:* {application_no}\n*Class:* {standard}\n*Date:* {exam_date}\n*Venue:* {venue}\n*Maps:* {map_url or 'N/A'}",
        application_no, scholarship_title, name
    )

async def send_whatsapp_wath_carnival(phone, name, application_no, exam_date, exam_time, venue, pdf_bytes, **kwargs):
    return await _send_template_with_pdf(
        phone, "wath_carnival", pdf_bytes, f"WATH_Carnival_{application_no}.pdf",
        [name, application_no, exam_date, exam_time, venue],
        f"🎪 [WATH Carnival Admit Card] App No: {application_no}",
        f"🎪 *WATH Carnival Pass*\n\n*Name:* {name}\n*App No:* {application_no}\n*Date:* {exam_date}\n*Time:* {exam_time}\n*Venue:* {venue}\n",
        application_no, "WATH Carnival", name
    )

async def send_whatsapp_otp(phone: str, code: str) -> tuple[bool, str]:
    phone_id, access_token = os.environ.get("WHATSAPP_PHONE_NUMBER_ID"), os.environ.get("WHATSAPP_ACCESS_TOKEN")
    if not (phone_id and access_token): return False, "Missing credentials"
    
    clean_phone = "".join(filter(str.isdigit, str(phone).split(".")[0]))
    if len(clean_phone) == 10: clean_phone = f"91{clean_phone}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            payload = {
                "messaging_product": "whatsapp", "recipient_type": "individual", "to": clean_phone, "type": "template",
                "template": {
                    "name": "opt", "language": {"code": "en"},
                    "components": [{"type": "body", "parameters": [{"type": "text", "text": code}]}, {"type": "button", "sub_type": "url", "index": "0", "parameters": [{"type": "text", "text": code}]}]
                }
            }
            msg_res = await client.post(f"https://graph.facebook.com/v18.0/{phone_id}/messages", json=payload, headers={"Authorization": f"Bearer {access_token}"})
            msg_res.raise_for_status()
            
            if wa_msg_id := (msg_res.json().get("messages") or [{}])[0].get("id"):
                await _log_automated_message_to_inbox(clean_phone, wa_msg_id, f"🔐 [OTP] {code} is your verification code.", "text", text=f"{code} is your verification code. For your security, do not share this code. Expires in 5 minutes.")
            return True, ""
        except Exception as e:
            return False, str(e)
