with open('backend/whatsapp_inbox.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('                await db.wa_messages.insert_one(doc)'):
        new_lines.append('        await db.wa_messages.insert_one(doc)\n')
    elif line.startswith('                await send_super_admin_notification('):
        new_lines.append('        await send_super_admin_notification(\n')
    elif line.startswith('                    title=f"New WhatsApp from'):
        new_lines.append('            title=f"New WhatsApp from {contact.get(\'name\', contact.get(\'phone\', \'Unknown\'))}",\n')
    elif line.startswith('                    body=doc.get("text") or "Media message received",'):
        new_lines.append('            body=doc.get("text") or "Media message received",\n')
    elif line.startswith('                    target_path=f"/admin/whatsapp?thread_id={thread[\'id\']}"'):
        new_lines.append('            target_path=f"/admin/whatsapp?thread_id={thread[\'id\']}"\n')
    elif line.startswith('                )'):
        new_lines.append('        )\n')
    else:
        new_lines.append(line)

with open('backend/whatsapp_inbox.py', 'w') as f:
    f.writelines(new_lines)
