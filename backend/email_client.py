import os, smtplib, logging
from email.message import EmailMessage

log = logging.getLogger("email")
def _smtp_config():
    return {"host": os.environ.get("SMTP_HOST", "smtp.gmail.com"), "port": int(os.environ.get("SMTP_PORT", "587")), "user": os.environ.get("SMTP_USER"), "password": os.environ.get("SMTP_PASSWORD"), "from_name": os.environ.get("SMTP_FROM_NAME", "Unacademy Offline Centre")}

def send_email(to_email, subject, html_body, text_body=None, attachments=None):
    c = _smtp_config()
    if not c["user"] or not c["password"]: return False
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, f'{c["from_name"]} <{c["user"]}>', to_email
    msg.set_content(text_body or "Please view this email in HTML.")
    msg.add_alternative(html_body, subtype="html")
    for file_bytes, filename, mime_type in (attachments or []):
        maintype, subtype = mime_type.split("/", 1) if "/" in mime_type else ("application", "octet-stream")
        msg.add_attachment(file_bytes, maintype=maintype, subtype=subtype, filename=filename)
    try:
        with smtplib.SMTP(c["host"], c["port"], timeout=20) as s:
            s.ehlo(); s.starttls(); s.login(c["user"], c["password"]); s.send_message(msg)
        return True
    except Exception as e:
        log.error(f"Email fail {to_email}: {e}")
        return False

def _wrap(title, body_html):
    return f'<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Helvetica,sans-serif;color:#0f172a;"><table width="100%" style="background:#f8fafc;padding:40px 16px;"><tr><td align="center"><table width="600" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"><tr><td style="background:#002FA7;padding:20px 28px;color:#ffffff;"><div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;color:#FFC107;">Unacademy Offline Centre</div><div style="font-size:22px;font-weight:900;margin-top:6px;">{title}</div></td></tr><tr><td style="padding:28px;line-height:1.6;font-size:15px;">{body_html}</td></tr><tr><td style="background:#f8fafc;padding:18px 28px;color:#475569;font-size:12px;text-align:center;border-top:1px solid #e2e8f0;">Unacademy Offline Centre · Kashmir · +91-8766238623</td></tr></table></td></tr></table></body></html>'

def email_enrollment_received(to_email, name, receipt_no, course_title, center):
    return send_email(to_email, "Enrollment received — Unacademy Offline Centre", _wrap("Enrollment Received", f"<p>Hi {name},</p><p>We received enrollment for <b>{course_title}</b> at <b>{center}</b>.</p><p>Receipt No: <b style='font-family:monospace;font-size:16px;color:#002FA7;'>{receipt_no}</b></p><p>Counselor will contact in 24h.</p><p>Thanks,<br/>Admissions</p>"))

def email_scholarship_received(to, name, app_no, exam, admit_card_bytes=None):
    atts = [(admit_card_bytes, f"AdmitCard_{app_no}.pdf", "application/pdf")] if admit_card_bytes else None
    return send_email(to, f"Registration Successful – Admit Card #{app_no} | Unacademy", _wrap("Scholarship Admit Card", f"<p>Hi {name},</p><p>Application for <b>Scholarship Test ({exam})</b> registered.</p><p>App No: <b style='font-family:monospace;font-size:16px;color:#002FA7;'>{app_no}</b></p><p><b>Admit Card attached.</b> Bring hard copy and ID.</p><p>Best of luck,<br/>Academic Team</p>"), attachments=atts)

def email_job_app_received(to, name, job):
    return send_email(to, "Application received — Unacademy Offline Centre", _wrap("Application Received", f"<p>Hi {name},</p><p>Thanks for applying for <b>{job}</b>.</p><p>HR will reach out if a fit.</p><p>Regards,<br/>HR Team</p>"))

def email_scholarship_result_published(to, name, app_no, pct, marks, total, rank=None, url=None):
    cta = f'<p style="text-align:center;margin-top:16px;"><a href="{url}" style="display:inline-block;background:#002FA7;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Download Result Card (PDF)</a></p>' if url else ""
    return send_email(to, "🎉 Scholarship Result Declared — Unacademy Offline Centre", _wrap("Your Result is Out", f"<p>Hi {name},</p><p>Your result has been declared.</p><p>App No: <b style='font-family:monospace;font-size:15px;color:#002FA7;'>{app_no}</b></p><p>Marks: <b>{marks} / {total}</b></p>{f'<p>Rank: <b>{rank}</b></p>' if rank else ''}<p style='margin-top:14px;font-size:18px;'>Scholarship awarded: <b style='color:#10B981;font-size:24px;'>{pct}%</b> off tuition.</p>{cta}<p style='margin-top:20px;'>Visit nearest centre within 7 days to claim.</p><p>Congratulations,<br/>Academic Team</p>"))

def email_admin_notification(sub, html):
    to = os.environ.get("ADMIN_NOTIFY_EMAIL")
    return send_email(to, sub, _wrap("Admin Notification", html)) if to else False
