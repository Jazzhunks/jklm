with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# 1. Import
import_str = 'import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";'
new_imports = 'import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";\nimport LeadTransferModal from "@/pages/erp/modals/LeadTransferModal";\nimport { Replace } from "lucide-react";'
content = content.replace(import_str, new_imports)

# 2. State
state_str = 'const [enrollModalLead, setEnrollModalLead] = useState(null);'
new_state = 'const [enrollModalLead, setEnrollModalLead] = useState(null);\n  const [transferModalLead, setTransferModalLead] = useState(null);'
content = content.replace(state_str, new_state)

# 3. Add Transfer button to card top right
old_card_top = """                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(lead); }}"""

new_card_top = """                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setTransferModalLead(lead); }}
                            title="Transfer Branch"
                            className="text-muted-foreground hover:text-indigo-500 transition"
                          >
                            <Replace size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(lead); }}"""
content = content.replace(old_card_top, new_card_top)

# 4. Render modal
modals_str = '{enrollModalLead && <LeadEnrollModal lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}'
new_modals = '{enrollModalLead && <LeadEnrollModal lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}\n      {transferModalLead && <LeadTransferModal lead={transferModalLead} branches={branches} onClose={() => setTransferModalLead(null)} />}'
content = content.replace(modals_str, new_modals)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLeads transfer")
