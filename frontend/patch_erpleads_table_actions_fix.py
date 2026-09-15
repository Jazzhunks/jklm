with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

old_table_actions = """                        {l.status !== "converted" && (
                          <button
                            onClick={() => updateStage(l.id, "converted")}
                            title="Convert to Student"
                            className="inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition"
                          >
                            Enroll
                          </button>
                        )}"""

new_table_actions = """                        {["new", "contacted", "follow_up"].includes(l.status) && (
                          <button
                            onClick={() => setProposeModalLead(l)}
                            title="Propose Admission"
                            className="p-1 text-muted-foreground hover:text-fuchsia-500 hover:bg-fuchsia-500/10 rounded transition"
                          >
                            <Target size={14} />
                          </button>
                        )}
                        {l.status === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
                          <button
                            onClick={() => setReviewModalLead(l)}
                            title="Review Proposed Fee"
                            className="p-1 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded transition"
                          >
                            <AlertCircle size={14} />
                          </button>
                        )}
                        {l.status === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
                          <button
                            onClick={() => setEnrollModalLead(l)}
                            title="Process Admission"
                            className="p-1 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10 rounded transition"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}"""

content = content.replace(old_table_actions, new_table_actions)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLeads Table actions")
