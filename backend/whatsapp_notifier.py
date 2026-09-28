import asyncio, logging
from whatsapp_client import send_whatsapp_exam_notification
from pdf_client import admit_card_pdf

log = logging.getLogger("whatsapp_notifier")

async def broadcast_scholarship_details(scholarship_id: str, job_id: str = None):
    from core.database import db 
    
    if not (campaign := await db.scholarships.find_one({"id": scholarship_id}, {"_id": 0})):
        if job_id: await db.bulk_jobs.update_one({"id": job_id}, {"$set": {"status": "failed"}, "$push": {"recent_logs": {"$each": ["❌ Campaign not found"], "$slice": -15}}})
        return

    if job_id: await db.bulk_jobs.update_one({"id": job_id}, {"$set": {"status": "processing"}})

    title, date, time = campaign.get("title", "Scholarship Test"), campaign.get("exam_date", "TBA"), campaign.get("exam_time", "10:00 AM")
    maps = {"Parraypora": "https://maps.app.goo.gl/cWrYBKC7RvX4Ed6GA", "Sopore": "https://maps.app.goo.gl/JNXrwZqVf6LFN8rFA", "Anantnag": "https://maps.app.goo.gl/U5bV2vv1FW1nhxTC9", "Zakura": "https://maps.app.goo.gl/x98VqHhsBvD2AEqZA"}
    
    for app in await db.scholarship_applications.find({"scholarship_id": scholarship_id}).to_list(None):
        try:
            venue, app_no, name, phone, std = app.get("venue", "TBA"), app.get("application_no", ""), app.get("name", "Applicant"), app.get("phone", ""), app.get("standard", "N/A")
            pdf = await asyncio.to_thread(admit_card_pdf, application_no=app_no, name=name, phone=phone, school=app.get("school", ""), standard=std, target_exam=app.get("target_exam", "N/A"), exam_date=date, venue=venue, exam_time=time, scholarship_title=title)
            await send_whatsapp_exam_notification(phone=phone, name=name, scholarship_title=title, application_no=app_no, standard=std, exam_date=date, venue=venue, map_url=maps.get(venue, "https://maps.app.goo.gl/ehUGrY51uL8Dputz5"), pdf_bytes=pdf)
            if job_id: await db.bulk_jobs.update_one({"id": job_id}, {"$inc": {"processed": 1, "success": 1}, "$push": {"recent_logs": {"$each": [f"✅ Sent Notification to {name} ({app_no})"], "$slice": -15}}})
            await asyncio.sleep(0.1)
        except Exception as e:
            if job_id: await db.bulk_jobs.update_one({"id": job_id}, {"$inc": {"processed": 1, "errors": 1}, "$push": {"recent_logs": {"$each": [f"❌ Failed for {app.get('name')} ({app.get('application_no')}): {e}"], "$slice": -15}}})

    if job_id: await db.bulk_jobs.update_one({"id": job_id}, {"$set": {"status": "completed"}, "$push": {"recent_logs": {"$each": ["✨ Broadcast Completed Successfully!"], "$slice": -15}}})
