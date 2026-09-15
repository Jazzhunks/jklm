with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Update Schema
old_schema = """class LeadInteraction(BaseModel):
    type: Literal["call", "whatsapp", "email", "note", "status_change"]
    notes: str
    contacted_at: Optional[str] = None"""

new_schema = """class LeadInteraction(BaseModel):
    type: Literal["call", "whatsapp", "email", "note", "status_change"]
    notes: str
    contacted_at: Optional[str] = None
    next_followup_at: Optional[str] = None"""

content = content.replace(old_schema, new_schema)


# 2. Update Endpoint
old_endpoint = """        interaction = {
            "id": new_id(), "type": payload.type, "notes": payload.notes,
            "created_at": now_iso(), "contacted_at": payload.contacted_at or now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$push": {"interactions": interaction}, "$set": {"updated_at": now_iso()}})
        return {"ok": True, "interaction": interaction}"""

new_endpoint = """        interaction = {
            "id": new_id(), "type": payload.type, "notes": payload.notes,
            "created_at": now_iso(), "contacted_at": payload.contacted_at or now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        update_set = {"updated_at": now_iso()}
        if payload.next_followup_at:
            update_set["next_followup_at"] = payload.next_followup_at
            if lead.get("status") in {"new", "contacted"}:
                update_set["status"] = "follow_up"
        elif lead.get("status") == "new" and payload.type in {"call", "whatsapp", "email"}:
            update_set["status"] = "contacted"
            
        await db.erp_leads.update_one({"id": lead_id}, {"$push": {"interactions": interaction}, "$set": update_set})
        return {"ok": True, "interaction": interaction}"""

content = content.replace(old_endpoint, new_endpoint)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend interactions")
