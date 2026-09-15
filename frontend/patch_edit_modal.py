import re
with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

# Make sure STUDENT_CLASSES is imported
content = content.replace('import { api, API_BASE } from "@/lib/api";', 'import { api, API_BASE } from "@/lib/api";\nimport { STUDENT_CLASSES } from "@/lib/erpApi";')

old_class_input = """            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Current Class</label>
              <input type="text" value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} placeholder="e.g. 11th / NEET Repeater" className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>"""

new_class_input = """            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Current Class</label>
              <select value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent">
                <option value="">Select Class</option>
                {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>"""
content = content.replace(old_class_input, new_class_input)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching EditStudentProfileModal")
