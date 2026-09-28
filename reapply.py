import os

with open('backend/erp_routes.py', 'r') as f:
    content = f.read()

if 'from core.database import send_super_admin_notification' not in content:
    content = content.replace('from pydantic import BaseModel', 'from pydantic import BaseModel\nfrom core.database import send_super_admin_notification')

# 1. super_dashboard leads
old_return = """        return {
            "total_revenue": total_rev,
            "total_expense": total_exp,
            "net_income": total_rev - total_exp,
            "total_pending_fees": pending_total,
            "total_students": sum(r["students"] for r in rows),
            "total_branches": len(rows),
            "branches": rows,
        }"""
        
new_return = """        all_leads = await db.erp_leads.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
        return {
            "total_revenue": total_rev,
            "total_expense": total_exp,
            "net_income": total_rev - total_exp,
            "total_pending_fees": pending_total,
            "total_students": sum(r["students"] for r in rows),
            "total_branches": len(rows),
            "branches": rows,
            "leads": all_leads,
        }"""
content = content.replace(old_return, new_return)

# 2. alerts
alerts_endpoint = """
    @erp.get("/alerts")
    async def get_alerts(user: dict = Depends(require_erp)):
        alerts = []
        if user["role"] in {"super_admin", "admin", "center_manager"}:
            query = {"status": "pending_approval"}
            if user["role"] != "super_admin":
                query["branch_id"] = {"$in": ["all", user.get("branch_id")]}
            pending_leads = await db.erp_leads.find(query, {"_id": 0}).to_list(50)
            for l in pending_leads:
                alerts.append({
                    "id": l["id"],
                    "type": "lead_approval",
                    "title": "Fee Approval Required",
                    "message": f"{l.get('name')} needs approval for ₹{l.get('proposed_fee')} in {l.get('moving_to_class')}",
                    "link": f"/erp?lead={l['id']}",
                    "timestamp": l.get("updated_at")
                })
        
        if user["role"] in {"counsellor", "center_manager"}:
            query = {"created_by": user["id"], "status": {"$in": ["approved_for_accounts", "rejected_fee"]}}
            status_leads = await db.erp_leads.find(query, {"_id": 0}).sort("updated_at", -1).limit(20).to_list(20)
            for l in status_leads:
                status_text = "Approved" if l["status"] == "approved_for_accounts" else "Rejected"
                alerts.append({
                    "id": f"status_{l['id']}",
                    "type": "lead_status",
                    "title": f"Fee Proposal {status_text}",
                    "message": f"Your proposal for {l.get('name')} was {status_text.lower()}.",
                    "link": f"/erp/leads?lead={l['id']}",
                    "timestamp": l.get("updated_at")
                })
                
        alerts.sort(key=lambda x: x["timestamp"] or "", reverse=True)
        return {"alerts": alerts[:30]}
"""
if "/alerts" not in content:
    content = content.replace('# ===== BRANCHES =====', alerts_endpoint + '\n    # ===== BRANCHES =====')

# 3. propose_lead notification
old_update = """        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "status": "pending_approval",
            "proposed_fee": payload.proposed_fee,
            "moving_to_class": payload.moving_to_class,
            "proposed_batch": payload.batch_name,
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        return {"ok": True}"""

new_update = """        await db.erp_leads.update_one({"id": lead_id}, {"$set": {
            "status": "pending_approval",
            "proposed_fee": payload.proposed_fee,
            "moving_to_class": payload.moving_to_class,
            "proposed_batch": payload.batch_name,
            "updated_at": now_iso()
        }, "$push": {"interactions": interaction}})
        
        counselor_name = user.get("name", "A counselor")
        await send_super_admin_notification(
            title="Action Required: Fee Approval",
            body=f"{counselor_name} proposed ₹{payload.proposed_fee} for {lead.get('name', 'Student')} (Class {payload.moving_to_class}).",
            target_path="/erp"
        )
        return {"ok": True}"""
content = content.replace(old_update, new_update)

with open('backend/erp_routes.py', 'w') as f:
    f.write(content)

