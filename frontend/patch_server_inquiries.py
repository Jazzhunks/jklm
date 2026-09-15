with open("../backend/server.py", "r") as f:
    content = f.read()

old_inquiry = """@api.post("/inquiries")
async def create_inquiry(payload: InquiryIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one(doc)
    return {"ok": True, "id": doc["id"]}"""

new_inquiry = """@api.post("/inquiries")
async def create_inquiry(payload: InquiryIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one(doc)
    
    # NEW CRM LOGIC: Also create a lead automatically
    lead_doc = {
        "id": str(uuid.uuid4()),
        "name": doc.get("name", ""),
        "phone": doc.get("phone", ""),
        "present_class": doc.get("present_class"),
        "moving_to_class": None,
        "address": None,
        "remarks": doc.get("message"),
        "branch_id": "all", # Default branch, counsellors can re-assign
        "counsellor_id": None,
        "status": "new",
        "temperature": "hot", # Inquiries are hot leads!
        "source": "Website Form",
        "interactions": [{
            "id": str(uuid.uuid4()),
            "type": "status_change",
            "notes": f"Lead automatically created from Website Inquiry. Message: {doc.get('message', '')}",
            "created_at": doc["created_at"],
            "contacted_at": doc["created_at"],
            "created_by": "system",
            "created_by_name": "Website"
        }],
        "created_at": doc["created_at"],
        "created_by": "system"
    }
    await db.erp_leads.insert_one(lead_doc)
    
    return {"ok": True, "id": doc["id"]}"""

content = content.replace(old_inquiry, new_inquiry)

with open("../backend/server.py", "w") as f:
    f.write(content)
print("Done server.py logic")
