with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

old_stages = """const STAGES = [
  { id: "new", label: "New Leads", color: "sky", style: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  { id: "contacted", label: "Contacted", color: "indigo", style: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  { id: "follow_up", label: "Follow-Up Scheduled", color: "amber", style: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  { id: "converted", label: "Enrolled Student", color: "emerald", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" },
  { id: "lost", label: "Closed / Lost", color: "rose", style: "border-rose-500/30 bg-rose-500/10 text-rose-500" },
];"""

new_stages = """const STAGES = [
  { id: "new", label: "New Leads", color: "sky", style: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  { id: "contacted", label: "Contacted", color: "indigo", style: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  { id: "follow_up", label: "Follow-Up", color: "amber", style: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  { id: "pending_approval", label: "Pending Approval", color: "fuchsia", style: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400" },
  { id: "approved_for_accounts", label: "Accounts Handoff", color: "orange", style: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
  { id: "converted", label: "Converted", color: "emerald", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" },
  { id: "lost", label: "Closed / Lost", color: "rose", style: "border-rose-500/30 bg-rose-500/10 text-rose-500" },
];"""

content = content.replace(old_stages, new_stages)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching STAGES")
