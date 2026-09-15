with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# 1. Update Pipeline Potential calculation
old_metric = """<div className="text-3xl font-black text-indigo-500 font-display">
            ₹{(((items?.length || 0) * 45000) / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] font-semibold text-indigo-500 flex items-center gap-1 mt-2 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full">Estimated Value (Avg ₹45k)</div>"""

new_metric = """<div className="text-3xl font-black text-indigo-500 font-display">
            ₹{((stageBuckets["pending_approval"]?.reduce((sum, l) => sum + (Number(l.proposed_fee) || 0), 0) || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] font-semibold text-indigo-500 flex items-center gap-1 mt-2 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full">Based on Pending Approval</div>"""

content = content.replace(old_metric, new_metric)


# 2. Update Table Actions
old_table_actions = """                        {l.status !== "converted" && (
                          <button
                            onClick={() => updateStage(l.id, "converted")}
                            title="Convert to Student"
                            className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLead(l)}"""

new_table_actions = """                        {["new", "contacted", "follow_up"].includes(l.status) && (
                          <button
                            onClick={() => setProposeModalLead(l)}
                            title="Propose Admission"
                            className="p-1 text-muted-foreground hover:text-fuchsia-500 hover:bg-fuchsia-500/10 rounded transition"
                          >
                            <Target size={14} />
                          </button>
                        )}
                        {l.status === "pending_approval" && isManagerPlus(erpUser) && (
                          <button
                            onClick={() => setReviewModalLead(l)}
                            title="Review Proposed Fee"
                            className="p-1 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded transition"
                          >
                            <AlertCircle size={14} />
                          </button>
                        )}
                        {l.status === "approved_for_accounts" && (isFinance(erpUser) || isManagerPlus(erpUser)) && (
                          <button
                            onClick={() => setEnrollModalLead(l)}
                            title="Process Admission"
                            className="p-1 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10 rounded transition"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLead(l)}"""

content = content.replace(old_table_actions, new_table_actions)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLeads Table actions")
