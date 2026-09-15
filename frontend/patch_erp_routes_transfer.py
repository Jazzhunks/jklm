with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Lead Transfer Endpoint & Schema
schema = """class LeadTransferRequest(BaseModel):
    branch_id: str
    notes: Optional[str] = None
"""

transfer_endpoint = """
    @erp.post("/leads/{lead_id}/transfer")
    async def transfer_lead(lead_id: str, payload: LeadTransferRequest, user: dict = Depends(require_erp)):
        if user["role"] not in {"super_admin", "center_manager", "counsellor"}:
            raise HTTPException(403, "Not allowed")
        lead = await db.erp_leads.find_one({"id": lead_id})
        if not lead: raise HTTPException(404, "Lead not found")
        
        branch = await db.centers.find_one({"id": payload.branch_id})
        if not branch: raise HTTPException(404, "Branch not found")
        
        interaction = {
            "id": new_id(), "type": "status_change",
            "notes": f"Lead transferred to branch: {branch.get('name')}. Notes: {payload.notes or 'None'}",
            "created_at": now_iso(), "contacted_at": now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "branch_id": payload.branch_id,
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        return {"ok": True}
"""

if "class LeadTransferRequest" not in content:
    content = content.replace("class LeadInteraction(BaseModel):", schema + "\nclass LeadInteraction(BaseModel):")

if "def transfer_lead(" not in content:
    content = content.replace("# ===== DASHBOARDS =====", transfer_endpoint + "\n    # ===== DASHBOARDS =====")


# 2. Auto-Convert on direct student creation
auto_convert = """        try:
            await db.erp_students.insert_one(doc)
            doc.pop("_id", None)
            
            # AUTO-CONVERT ANY MATCHING PIPELINE LEADS
            matching_leads = await db.erp_leads.find({"phone": payload.contact_phone, "status": {"$in": ["new", "contacted", "follow_up", "pending_approval", "approved_for_accounts"]}}).to_list(100)
            for l in matching_leads:
                interaction = {
                    "id": new_id(), "type": "status_change",
                    "notes": f"Lead AUTO-CONVERTED because the student was manually enrolled. Student ID: {doc['id']}",
                    "created_at": now_iso(), "contacted_at": now_iso(),
                    "created_by": user["id"], "created_by_name": "System"
                }
                await db.erp_leads.update_one({"id": l["id"]}, {"$set": {
                    "status": "converted",
                    "converted_student_id": doc["id"],
                    "updated_at": now_iso()
                }, "$push": {"interactions": interaction}})
                
        except Exception as e:
            raise HTTPException(500, f"Database insert error: {e}")"""

old_insert = """        try:
            await db.erp_students.insert_one(doc)
            doc.pop("_id", None)
        except Exception as e:
            raise HTTPException(500, f"Database insert error: {e}")"""

content = content.replace(old_insert, auto_convert)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done erp_routes logic")
