with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

old_kanban_actions = """                        {stage.id === "new" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStage(lead.id, "contacted"); }}
                            className="text-primary hover:underline font-bold flex items-center gap-0.5"
                          >
                            Contacted →
                          </button>
                        )}
                        {stage.id === "contacted" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStage(lead.id, "follow_up"); }}
                            className="text-amber-500 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Follow-Up →
                          </button>
                        )}
                        {stage.id === "follow_up" && (
                          <button
                            onClick={() => updateStage(lead.id, "converted")}
                            className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Enroll →
                          </button>
                        )}
                        {stage.id === "converted" && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Enrolled
                          </span>
                        )}"""

new_kanban_actions = """                        {["new", "contacted"].includes(stage.id) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStage(lead.id, stage.id === "new" ? "contacted" : "follow_up"); }}
                            className="text-primary hover:underline font-bold flex items-center gap-0.5"
                          >
                            {stage.id === "new" ? "Contacted" : "Follow Up"} →
                          </button>
                        )}
                        {["contacted", "follow_up"].includes(stage.id) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setProposeModalLead(lead); }}
                            className="text-fuchsia-500 hover:underline font-bold flex items-center gap-0.5 border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-0.5 rounded"
                          >
                            Propose Fee →
                          </button>
                        )}
                        {stage.id === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewModalLead(lead); }}
                            className="text-orange-500 hover:underline font-bold flex items-center gap-0.5 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded"
                          >
                            Review Fee →
                          </button>
                        )}
                        {stage.id === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEnrollModalLead(lead); }}
                            className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5 border border-emerald-600/20 bg-emerald-600/10 px-2 py-0.5 rounded"
                          >
                            Process Admission →
                          </button>
                        )}
                        {stage.id === "converted" && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Enrolled
                          </span>
                        )}"""

content = content.replace(old_kanban_actions, new_kanban_actions)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching Kanban actions")
