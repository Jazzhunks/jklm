import re
with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

# Add import for FeeMatrixConfigModal if missing
if "FeeMatrixConfigModal" not in content:
    content = content.replace('import { api, API_BASE } from "@/lib/api";', 'import { api, API_BASE } from "@/lib/api";\nimport FeeMatrixConfigModal from "./modals/FeeMatrixConfigModal";')

# Add state
if "showFeeMatrix" not in content:
    content = content.replace("  const [activeModal, setActiveModal] = useState(null);", "  const [activeModal, setActiveModal] = useState(null);\n  const [showFeeMatrix, setShowFeeMatrix] = useState(false);")

# Add button after New Admission
old_btn = """            <button onClick={() => setActiveModal("admission")} className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-lg whitespace-nowrap">
              <Plus size={14} /> <span className="whitespace-nowrap">New Admission</span>
            </button>
          )}"""

new_btn = """            <button onClick={() => setActiveModal("admission")} className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-lg whitespace-nowrap">
              <Plus size={14} /> <span className="whitespace-nowrap">New Admission</span>
            </button>
          )}
          {isSuper(erpUser) && (
            <button onClick={() => setShowFeeMatrix(true)} className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider transition border border-accent/20 shadow-md whitespace-nowrap">
              <span className="whitespace-nowrap">Fee Matrix</span>
            </button>
          )}"""
content = content.replace(old_btn, new_btn)

# Add modal rendering
if "<FeeMatrixConfigModal" not in content:
    content = content.replace('      {activeModal === "admission" && (', '      {showFeeMatrix && <FeeMatrixConfigModal onClose={() => setShowFeeMatrix(false)} />}\n      {activeModal === "admission" && (')

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done adding Fee Matrix button")
