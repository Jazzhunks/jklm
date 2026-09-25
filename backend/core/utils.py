import os, asyncio, logging
from fastapi import HTTPException
from datetime import datetime, timezone

ALLOWED_UPLOAD_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg", "image/jpg": "jpg",
    "image/png": "png", "image/webp": "webp",
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
}
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


from storage_client import init_storage, put_object, get_object, aclose as storage_aclose, APP_NAME
from pdf_client import admit_card_pdf, result_card_pdf
from whatsapp_client import send_whatsapp_otp, send_whatsapp_admit_card, send_whatsapp_wath_carnival
from whatsapp_notifier import broadcast_scholarship_details
from email_client import *
from whatsapp_broadcast import *
from onesignal_client import *
from notifications import *
