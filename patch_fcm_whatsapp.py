with open('backend/whatsapp_inbox.py', 'r') as f:
    wa = f.read()

fcm_import = """
from server import send_super_admin_notification
"""
if "from server import send_super_admin_notification" not in wa:
    wa = wa.replace('import json', 'import json\n' + fcm_import)

wa_hook = """
                await db.wa_messages.insert_one(doc)
                await send_super_admin_notification(
                    title=f"New WhatsApp from {contact.get('name', contact.get('phone', 'Unknown'))}",
                    body=doc.get("text") or "Media message received",
                    target_path=f"/admin/whatsapp?thread_id={thread['id']}"
                )
"""
wa = wa.replace('await db.wa_messages.insert_one(doc)', wa_hook)

with open('backend/whatsapp_inbox.py', 'w') as f:
    f.write(wa)
print("whatsapp_inbox.py patched with FCM")
