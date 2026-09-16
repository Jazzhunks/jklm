import re
with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Fix import
import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"@/lib/erpApi";', content)
if import_match:
    imports = [i.strip() for i in import_match.group(1).split(",")]
    if "STUDENT_CLASSES" not in imports:
        imports.append("STUDENT_CLASSES")
    new_import = f'import {{ {", ".join(imports)} }} from "@/lib/erpApi";'
    content = content[:import_match.start()] + new_import + content[import_match.end():]

# Fix the class inputs in CreateLeadModal
old_class_section = re.search(r'<div><label.*?Present Class</label>.*?<input.*?present_class: e\.target\.value.*?></div>\s*<div><label.*?Moving To Class \*</label>.*?<input.*?moving_to_class: e\.target\.value.*?></div>', content, re.DOTALL)

if old_class_section:
    new_class_section = """<div>
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
          </div>"""
    content = content[:old_class_section.start()] + new_class_section + content[old_class_section.end():]

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done fixing ErpLeads.jsx")
