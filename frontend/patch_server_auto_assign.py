import random
with open("../backend/server.py", "r") as f:
    content = f.read()

# Update create_inquiry
old_inquiry_lead = """    # NEW CRM LOGIC: Also create a lead automatically
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
    await db.erp_leads.insert_one(lead_doc)"""

new_inquiry_lead = """    # NEW CRM LOGIC: Also create a lead automatically and AUTO-ASSIGN to a random counselor
    counselors = await db.users.find({"role": "counsellor"}, {"id": 1, "name": 1}).to_list(100)
    assigned_counselor = random.choice(counselors) if counselors else None
    
    lead_doc = {
        "id": str(uuid.uuid4()),
        "name": doc.get("name", ""),
        "phone": doc.get("phone", ""),
        "present_class": doc.get("present_class"),
        "moving_to_class": None,
        "address": None,
        "remarks": doc.get("message"),
        "branch_id": "all", # Default branch, counsellors can re-assign
        "counsellor_id": assigned_counselor["id"] if assigned_counselor else None,
        "status": "new",
        "temperature": "hot", # Inquiries are hot leads!
        "source": "Website Form",
        "interactions": [{
            "id": str(uuid.uuid4()),
            "type": "status_change",
            "notes": f"Lead automatically created from Website Inquiry. Auto-assigned to {assigned_counselor['name'] if assigned_counselor else 'nobody'}. Message: {doc.get('message', '')}",
            "created_at": doc["created_at"],
            "contacted_at": doc["created_at"],
            "created_by": "system",
            "created_by_name": "Website"
        }],
        "created_at": doc["created_at"],
        "created_by": "system"
    }
    await db.erp_leads.insert_one(lead_doc)"""

content = content.replace(old_inquiry_lead, new_inquiry_lead)


# Update create_enrollment
old_enroll = """    await db.enrollments.insert_one(doc)
    doc.pop("_id", None)"""

new_enroll = """    await db.enrollments.insert_one(doc)
    doc.pop("_id", None)
    
    # NEW CRM LOGIC: Create lead and AUTO-ASSIGN to a random counselor
    counselors = await db.users.find({"role": "counsellor"}, {"id": 1, "name": 1}).to_list(100)
    assigned_counselor = random.choice(counselors) if counselors else None
    
    lead_doc = {
        "id": str(uuid.uuid4()),
        "name": doc.get("name", ""),
        "phone": doc.get("phone", ""),
        "present_class": None,
        "moving_to_class": doc.get("course_title"),
        "address": None,
        "remarks": f"Enrolled online for {doc.get('course_title')}",
        "branch_id": "all",
        "counsellor_id": assigned_counselor["id"] if assigned_counselor else None,
        "status": "new",
        "temperature": "hot", 
        "source": "Online Enrollment",
        "interactions": [{
            "id": str(uuid.uuid4()),
            "type": "status_change",
            "notes": f"Lead automatically created from Online Enrollment. Auto-assigned to {assigned_counselor['name'] if assigned_counselor else 'nobody'}.",
            "created_at": doc["created_at"],
            "contacted_at": doc["created_at"],
            "created_by": "system",
            "created_by_name": "Website"
        }],
        "created_at": doc["created_at"],
        "created_by": "system"
    }
    await db.erp_leads.insert_one(lead_doc)"""

content = content.replace(old_enroll, new_enroll)

if "import random" not in content:
    content = "import random\n" + content

with open("../backend/server.py", "w") as f:
    f.write(content)
print("Done auto-assign logic")
