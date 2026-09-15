with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Imports
import_str = 'import LeadActivityDrawer from "@/pages/erp/modals/LeadActivityDrawer";'
new_imports = """import LeadActivityDrawer from "@/pages/erp/modals/LeadActivityDrawer";
import LeadProposeModal from "@/pages/erp/modals/LeadProposeModal";
import LeadReviewModal from "@/pages/erp/modals/LeadReviewModal";
import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";
import { isFinance } from "@/lib/erpApi";"""
content = content.replace(import_str, new_imports)

# State for modals
state_str = 'const [selectedLead, setSelectedLead] = useState(null);'
new_state = """const [selectedLead, setSelectedLead] = useState(null);
  const [proposeModalLead, setProposeModalLead] = useState(null);
  const [reviewModalLead, setReviewModalLead] = useState(null);
  const [enrollModalLead, setEnrollModalLead] = useState(null);"""
content = content.replace(state_str, new_state)

# Replace the stage buttons
old_actions = """                        {stage.id === "new" && (
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
                            Follow Up →
                          </button>
                        )}
                        {stage.id === "follow_up" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStage(lead.id, "converted"); }}
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

new_actions = """                        {["new", "contacted"].includes(stage.id) && (
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
                        {stage.id === "pending_approval" && isManagerPlus(erpUser) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewModalLead(lead); }}
                            className="text-orange-500 hover:underline font-bold flex items-center gap-0.5 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded"
                          >
                            Review Fee →
                          </button>
                        )}
                        {stage.id === "approved_for_accounts" && (isFinance(erpUser) || isManagerPlus(erpUser)) && (
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

content = content.replace(old_actions, new_actions)

# Modals render
modals_str = '{/* Delete Lead Confirmation Modal */}'
new_modals = """{proposeModalLead && <LeadProposeModal lead={proposeModalLead} onClose={() => setProposeModalLead(null)} />}
      {reviewModalLead && <LeadReviewModal lead={reviewModalLead} onClose={() => setReviewModalLead(null)} />}
      {enrollModalLead && <LeadEnrollModal lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}
      
      {/* Delete Lead Confirmation Modal */}"""
content = content.replace(modals_str, new_modals)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLeads workflow buttons and modals")
