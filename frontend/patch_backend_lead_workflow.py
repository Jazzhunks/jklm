with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

schema_insertion = """class LeadInteraction(BaseModel):
    type: Literal["call", "whatsapp", "email", "note", "status_change"]
    notes: str
    contacted_at: Optional[str] = None

class LeadProposeRequest(BaseModel):
    proposed_fee: float
    moving_to_class: str
    batch_name: Optional[str] = None
    notes: Optional[str] = None

class LeadApproveRequest(BaseModel):
    notes: Optional[str] = None

class LeadEnrollRequest(BaseModel):
    full_name: str
    contact_phone: str
    current_class: str
    batch: Optional[str] = None
    parent_name: str
    parent_phone: str
    parent_email: Optional[str] = None
    address: Optional[str] = None
    total_fee: float
    deposit_amount: float
    payment_mode: str
    payment_reference: Optional[str] = None
"""

if "class LeadProposeRequest" not in content:
    content = content.replace(
        "class LeadInteraction(BaseModel):\n    type: Literal[\"call\", \"whatsapp\", \"email\", \"note\", \"status_change\"]\n    notes: str\n    contacted_at: Optional[str] = None", 
        schema_insertion
    )
    if "class LeadInteraction(BaseModel):" not in content:
        # Just append it at the end of schemas
        content = content.replace("class AttendanceScanRequest(BaseModel):", schema_insertion + "\nclass AttendanceScanRequest(BaseModel):")

endpoints_insertion = """
    @erp.post("/leads/{lead_id}/interactions")
    async def add_lead_interaction(lead_id: str, payload: LeadInteraction, user: dict = Depends(require_erp)):
        if user["role"] not in {"super_admin", "center_manager", "counsellor"}:
            raise HTTPException(403, "Not allowed")
        lead = await db.erp_leads.find_one({"id": lead_id}, {"_id": 0})
        if not lead: raise HTTPException(404, "Lead not found")
        if user["role"] != "super_admin" and lead.get("branch_id") != user.get("branch_id"):
            raise HTTPException(403, "Cross-branch denied")
        interaction = {
            "id": new_id(), "type": payload.type, "notes": payload.notes,
            "created_at": now_iso(), "contacted_at": payload.contacted_at or now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$push": {"interactions": interaction}, "$set": {"updated_at": now_iso()}})
        return {"ok": True, "interaction": interaction}

    @erp.post("/leads/{lead_id}/propose")
    async def propose_lead(lead_id: str, payload: LeadProposeRequest, user: dict = Depends(require_erp)):
        lead = await db.erp_leads.find_one({"id": lead_id})
        if not lead: raise HTTPException(404, "Lead not found")
        interaction = {
            "id": new_id(), "type": "status_change",
            "notes": f"Counselor proposed admission for class {payload.moving_to_class} with total fee ₹{payload.proposed_fee}. Notes: {payload.notes or 'None'}",
            "created_at": now_iso(), "contacted_at": now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "status": "pending_approval",
            "proposed_fee": payload.proposed_fee,
            "moving_to_class": payload.moving_to_class,
            "proposed_batch": payload.batch_name,
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        return {"ok": True}

    @erp.post("/leads/{lead_id}/approve")
    async def approve_lead(lead_id: str, payload: LeadApproveRequest, user: dict = Depends(require_erp)):
        if user["role"] not in {"super_admin", "center_manager"}:
            raise HTTPException(403, "Only managers can approve fees")
        lead = await db.erp_leads.find_one({"id": lead_id})
        if not lead: raise HTTPException(404, "Lead not found")
        interaction = {
            "id": new_id(), "type": "status_change",
            "notes": f"Manager APPROVED the proposed fee. Handoff to accounts. Notes: {payload.notes or 'None'}",
            "created_at": now_iso(), "contacted_at": now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "status": "approved_for_accounts",
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        return {"ok": True}

    @erp.post("/leads/{lead_id}/reject")
    async def reject_lead(lead_id: str, payload: LeadApproveRequest, user: dict = Depends(require_erp)):
        if user["role"] not in {"super_admin", "center_manager"}:
            raise HTTPException(403, "Only managers can reject fees")
        lead = await db.erp_leads.find_one({"id": lead_id})
        if not lead: raise HTTPException(404, "Lead not found")
        interaction = {
            "id": new_id(), "type": "status_change",
            "notes": f"Manager REJECTED the proposed fee. Returned to counselor. Notes: {payload.notes or 'None'}",
            "created_at": now_iso(), "contacted_at": now_iso(),
            "created_by": user["id"], "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "status": "follow_up",
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        return {"ok": True}

    @erp.post("/leads/{lead_id}/enroll")
    async def enroll_lead(lead_id: str, payload: LeadEnrollRequest, user: dict = Depends(require_erp)):
        if user["role"] not in {"super_admin", "center_manager", "finance"}:
            raise HTTPException(403, "Only Accounts/Managers can process final admission")
        lead = await db.erp_leads.find_one({"id": lead_id})
        if not lead: raise HTTPException(404, "Lead not found")
        if lead.get("status") != "approved_for_accounts":
            raise HTTPException(400, "Lead must be approved by a manager first")
        branch_id = lead.get("branch_id")
        
        # 1. Create Student
        student_id = new_id()
        student_doc = {
            "id": student_id,
            "enrollment_number": f"NEW-{branch_id[:3].upper()}-{student_id[:6].upper()}",
            "full_name": payload.full_name,
            "contact_phone": payload.contact_phone,
            "current_class": payload.current_class,
            "batch": payload.batch,
            "parent_name": payload.parent_name,
            "parent_phone": payload.parent_phone,
            "parent_email": payload.parent_email,
            "address": payload.address,
            "total_fee": payload.total_fee,
            "branch_id": branch_id,
            "status": "active",
            "created_at": now_iso(),
            "created_by": user["id"]
        }
        await db.erp_students.insert_one(student_doc)
        
        # 2. Process First Deposit
        if payload.deposit_amount > 0:
            payment_doc = {
                "id": new_id(),
                "student_id": student_id,
                "amount": payload.deposit_amount,
                "mode": payload.payment_mode,
                "reference": payload.payment_reference,
                "branch_id": branch_id,
                "processed_by": user["id"],
                "created_at": now_iso()
            }
            await db.erp_payments.insert_one(payment_doc)
            
        # 3. Update Lead to Converted
        interaction = {
            "id": new_id(),
            "type": "status_change",
            "notes": f"Accounts finalized admission. Collected deposit: ₹{payload.deposit_amount}.",
            "created_at": now_iso(),
            "contacted_at": now_iso(),
            "created_by": user["id"],
            "created_by_name": user.get("name", "User")
        }
        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "status": "converted",
            "converted_student_id": student_id,
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        
        return {"ok": True, "student_id": student_id}

"""

if "def enroll_lead(" not in content:
    content = content.replace("# ===== DASHBOARDS =====", endpoints_insertion + "\n    # ===== DASHBOARDS =====")

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)

print("Backend endpoints patched successfully")
