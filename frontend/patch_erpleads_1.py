with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# 1. Import LeadActivityDrawer
import_str = "import { toast } from \"sonner\";"
new_import_str = "import { toast } from \"sonner\";\nimport LeadActivityDrawer from \"@/pages/erp/modals/LeadActivityDrawer\";"
content = content.replace(import_str, new_import_str)

# 2. Add Drawer to rendering
drawer_str = "{/* Delete Lead Confirmation Modal */}"
new_drawer_str = """{selectedLead && (
        <LeadActivityDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
      
      {/* Delete Lead Confirmation Modal */}"""
content = content.replace(drawer_str, new_drawer_str)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLeads 1")
