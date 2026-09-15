with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

# Add import
import_line = """import { isSuper } from "@/lib/erpApi";
import FeeMatrixConfigModal from "./modals/FeeMatrixConfigModal";"""

if "FeeMatrixConfigModal" not in content:
    content = content.replace('import { isSuper } from "@/lib/erpApi";', import_line)

# Add state
state_line = """  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showFeeMatrix, setShowFeeMatrix] = useState(false);"""
if "showFeeMatrix" not in content:
    content = content.replace("  const [paletteOpen, setPaletteOpen] = useState(false);", state_line)

# Add button in header
old_hdr = """            <button onClick={() => setPaletteOpen(true)} className="flex items-center justify-between w-64 bg-background/50 border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground px-4 py-2 rounded-xl transition-all shadow-sm">
              <span className="text-sm flex items-center gap-2"><Search size={15}/> Search ERP...</span>
              <kbd className="hidden sm:inline-block text-[10px] font-sans font-semibold bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground shadow-sm">⌘K</kbd>
            </button>
          </div>
        </div>"""
new_hdr = """            <button onClick={() => setPaletteOpen(true)} className="flex items-center justify-between w-64 bg-background/50 border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground px-4 py-2 rounded-xl transition-all shadow-sm">
              <span className="text-sm flex items-center gap-2"><Search size={15}/> Search ERP...</span>
              <kbd className="hidden sm:inline-block text-[10px] font-sans font-semibold bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground shadow-sm">⌘K</kbd>
            </button>
            {isSuper(erpUser) && (
              <button onClick={() => setShowFeeMatrix(true)} className="px-4 py-2 bg-accent/10 text-accent font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-accent/20 transition border border-accent/20">
                Fee Structure Matrix
              </button>
            )}
          </div>
        </div>"""
content = content.replace(old_hdr, new_hdr)

# Add modal to render
render_modal = """      {paletteOpen && <ErpCommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />}
      {showFeeMatrix && <FeeMatrixConfigModal onClose={() => setShowFeeMatrix(false)} />}
    </main>"""
content = content.replace("      {paletteOpen && <ErpCommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />}\n    </main>", render_modal)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done patching ErpDashboard")
