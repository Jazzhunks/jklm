with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "r") as f:
    content = f.read()

# Add action buttons inside LeadActivityDrawer
# We need to import the modals and icons
import_str = 'import { X, Phone, MessageCircle, Mail, FileText, CheckCircle2, Clock, Calendar } from "lucide-react";'
new_import_str = """import { X, Phone, MessageCircle, Mail, FileText, CheckCircle2, Clock, Calendar, Target, AlertCircle, Replace, Trash2 } from "lucide-react";
import LeadProposeModal from "@/pages/erp/modals/LeadProposeModal";
import LeadReviewModal from "@/pages/erp/modals/LeadReviewModal";
import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";
import LeadTransferModal from "@/pages/erp/modals/LeadTransferModal";
import { isSuper } from "@/lib/erpApi";"""
content = content.replace(import_str, new_import_str)

# Add states for modals inside Drawer (actually, maybe better to just use the ones from ErpLeads, but Drawer is easier self-contained or we can pass handlers)
# Let's just add the states inside Drawer
state_str = 'const [isSubmitting, setIsSubmitting] = useState(false);'
new_state_str = """const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposeModal, setProposeModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  
  const erpUser = JSON.parse(localStorage.getItem("nw_user") || "{}"); // fallback"""
content = content.replace(state_str, new_state_str)

# Add buttons below the Header
header_end = """<div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition"><X size={18} /></button>
          </div>
        </div>"""

actions_ui = """<div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition"><X size={18} /></button>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="px-4 py-2 bg-card border-b border-border flex gap-2 overflow-x-auto custom-scrollbar">
          {["new", "contacted", "follow_up"].includes(lead.status) && (
            <button onClick={() => setProposeModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 rounded-lg text-xs font-bold hover:bg-fuchsia-500/20 transition whitespace-nowrap">
              <Target size={14}/> Propose Fee
            </button>
          )}
          {lead.status === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
            <button onClick={() => setReviewModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs font-bold hover:bg-orange-500/20 transition whitespace-nowrap">
              <AlertCircle size={14}/> Review Proposal
            </button>
          )}
          {lead.status === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
            <button onClick={() => setEnrollModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 rounded-lg text-xs font-bold hover:bg-emerald-600/20 transition whitespace-nowrap">
              <CheckCircle2 size={14}/> Process Admission
            </button>
          )}
          <button onClick={() => setTransferModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition whitespace-nowrap">
            <Replace size={14}/> Transfer Branch
          </button>
        </div>"""

content = content.replace(header_end, actions_ui)

# Add modal renders at the end of the return statement
modal_renders = """      </div>
      
      {/* Drawer Modals */}
      {proposeModal && <LeadProposeModal lead={lead} onClose={() => setProposeModal(false)} />}
      {reviewModal && <LeadReviewModal lead={lead} onClose={() => setReviewModal(false)} />}
      {enrollModal && <LeadEnrollModal lead={lead} onClose={() => setEnrollModal(false)} />}
      {transferModal && <LeadTransferModal lead={lead} branches={[]} onClose={() => setTransferModal(false)} />}
    </div>
  );"""

content = content.replace("""      </div>
    </div>
  );""", modal_renders)

with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "w") as f:
    f.write(content)
print("Done patching drawer actions")
