import re
with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

content = content.replace('import { erp, canManageLeads, formatPhone, formatDateTime } from "@/lib/erpApi";', 'import { erp, canManageLeads, formatPhone, formatDateTime, STUDENT_CLASSES } from "@/lib/erpApi";')

old_class = """        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Present Class</label>
          <input value={form.present_class} onChange={e => setForm({...form, present_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Moving To Class *</label>
          <input required value={form.moving_to_class} onChange={e => setForm({...form, moving_to_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        </div>"""

new_class = """        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Present Class</label>
            <select value={form.present_class} onChange={e => setForm({...form, present_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              <option value="">Select Class</option>
              {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Moving To Class *</label>
            <select required value={form.moving_to_class} onChange={e => setForm({...form, moving_to_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              <option value="">Select Class</option>
              {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>"""

content = content.replace(old_class, new_class)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching CreateLeadModal")
