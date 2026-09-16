import os
import re

with open("whatsapp_client.py", "r") as f:
    content = f.read()

otp_func = """
# ---------------------------------------------------------
# TEMPLATE: AUTH OTP
# ---------------------------------------------------------
async def send_whatsapp_otp(phone: str, code: str) -> bool:
    \"\"\"
    Sends the 6-digit OTP using the 'opt' template.
    Template ID: 1010988851963641 (Name: opt)
    \"\"\"
    phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
    access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN")

    if not phone_id or not access_token:
        log.warning("WhatsApp credentials missing; skipping OTP send.")
        return False

    clean_phone = str(phone).split(".")[0].strip()
    clean_phone = "".join(filter(str.isdigit, clean_phone))
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            msg_url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": clean_phone,
                "type": "template",
                "template": {
                    "name": "opt",
                    "language": {"code": "en"},
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": code}
                            ],
                        }
                    ],
                },
            }

            headers = {"Authorization": f"Bearer {access_token}"}
            msg_res = await client.post(msg_url, json=payload, headers=headers)
            msg_res.raise_for_status()
            
            result = msg_res.json()
            wa_msg_id = (result.get("messages") or [{}])[0].get("id")
            
            if wa_msg_id:
                # Log to inbox silently
                await _log_automated_message_to_inbox(
                    clean_phone=clean_phone,
                    wa_msg_id=wa_msg_id,
                    preview_text=f"🔐 [OTP] {code} is your verification code.",
                    msg_type="text",
                    caption=f"{code} is your verification code. For your security, do not share this code. Expires in 5 minutes."
                )

            log.info("OTP sent successfully to %s", clean_phone)
            return True
        except Exception as e:
            log.error("OTP WhatsApp delivery failed for %s: %s", clean_phone, str(e))
            return False
"""

if "send_whatsapp_otp" not in content:
    content += "\n" + otp_func

with open("whatsapp_client.py", "w") as f:
    f.write(content)
print("Done patching whatsapp_client.py")
