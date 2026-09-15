with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_lead_create = """class LeadCreate(BaseModel):
    name: str
    phone: str
    present_class: Optional[str] = None
    moving_to_class: Optional[str] = None
    address: Optional[str] = None
    remarks: Optional[str] = None
    branch_id: str
    counsellor_id: Optional[str] = None"""

new_lead_create = """class LeadCreate(BaseModel):
    name: str
    phone: str
    present_class: Optional[str] = None
    moving_to_class: Optional[str] = None
    address: Optional[str] = None
    remarks: Optional[str] = None
    branch_id: str
    counsellor_id: Optional[str] = None
    source: Optional[str] = "Manual"
    campaign: Optional[str] = None
    temperature: Optional[Literal["hot", "warm", "cold"]] = "warm\""""

old_lead_update = """class LeadUpdate(BaseModel):
    status: Optional[Literal["new", "contacted", "follow_up", "converted", "lost"]] = None
    present_class: Optional[str] = None
    moving_to_class: Optional[str] = None
    address: Optional[str] = None
    remarks: Optional[str] = None
    counsellor_id: Optional[str] = None
    next_followup_at: Optional[str] = None"""

new_lead_update = """class LeadUpdate(BaseModel):
    status: Optional[Literal["new", "contacted", "follow_up", "converted", "lost"]] = None
    present_class: Optional[str] = None
    moving_to_class: Optional[str] = None
    address: Optional[str] = None
    remarks: Optional[str] = None
    counsellor_id: Optional[str] = None
    next_followup_at: Optional[str] = None
    temperature: Optional[Literal["hot", "warm", "cold"]] = None
    source: Optional[str] = None

class LeadInteraction(BaseModel):
    type: Literal["call", "whatsapp", "email", "note", "status_change"]
    notes: str
    contacted_at: Optional[str] = None"""

content = content.replace(old_lead_create, new_lead_create)
content = content.replace(old_lead_update, new_lead_update)

# Add interactions endpoint
interaction_code = """
    @erp.post("/leads/{lead_id}/interactions")
    async def add_lead_interaction(lead_id: str, payload: LeadInteraction, user: dict = Depends(require_erp)):
        if user["role"] not in {"super_admin", "center_manager", "counsellor"}:
            raise HTTPException(403, "Not allowed")
            
        lead = await db.erp_leads.find_one({"id": lead_id}, {"_id": 0})
        if not lead:
            raise HTTPException(404, "Lead not found")
            
        if user["role"] != "super_admin" and lead.get("branch_id") != user.get("branch_id"):
            raise HTTPException(403, "Cross-branch denied")
            
        interaction = {
            "id": new_id(),
            "type": payload.type,
            "notes": payload.notes,
            "created_at": now_iso(),
            "contacted_at": payload.contacted_at or now_iso(),
            "created_by": user["id"],
            "created_by_name": user.get("name", "User")
        }
        
        await db.erp_leads.update_one(
            {"id": lead_id},
            {"$push": {"interactions": interaction}, "$set": {"updated_at": now_iso()}}
        )
        return {"ok": True, "interaction": interaction}
"""

# Insert interaction endpoint after delete_lead
if "@erp.delete(\"/leads/{lead_id}\")" in content:
    # Find the end of the delete_lead function
    parts = content.split("@erp.delete(\"/leads/{lead_id}\")")
    if len(parts) == 2:
        part1 = parts[0]
        part2 = parts[1]
        
        # find the end of the function by looking for the next @erp decorator or def
        # Or just append it right before `# ===== SETTINGS =====`
        settings_idx = part2.find("# ===== SETTINGS =====")
        if settings_idx != -1:
            part2 = part2[:settings_idx] + interaction_code + "\n    " + part2[settings_idx:]
            content = part1 + '@erp.delete("/leads/{lead_id}")' + part2

# Also update create_lead to include temperature and source
old_create_doc = """        doc.update({
            "id": new_id(),
            "status": "new",
            "counsellor_id": cid,
            "created_at": now_iso(),
            "created_by": user["id"],
        })"""
        
new_create_doc = """        doc.update({
            "id": new_id(),
            "status": "new",
            "counsellor_id": cid,
            "temperature": payload.temperature or "warm",
            "source": payload.source or "Manual",
            "interactions": [{
                "id": new_id(),
                "type": "status_change",
                "notes": "Lead created natively in ERP",
                "created_at": now_iso(),
                "contacted_at": now_iso(),
                "created_by": user["id"],
                "created_by_name": user.get("name", "System")
            }],
            "created_at": now_iso(),
            "created_by": user["id"],
        })"""

content = content.replace(old_create_doc, new_create_doc)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done backend erp_routes schemas")
