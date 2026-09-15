with open("src/pages/erp/modals/LeadProposeModal.jsx", "r") as f:
    content = f.read()

import re

# Add imports
content = content.replace('import { erp } from "@/lib/erpApi";', 'import { erp, STUDENT_CLASSES, STUDENT_COURSES } from "@/lib/erpApi";\nimport { useEffect } from "react";')

# Add state and matrix fetching
old_state = """  const queryClient = useQueryClient();
  const [form, setForm] = useState({ proposed_fee: "", moving_to_class: lead.moving_to_class || "", batch_name: "", notes: "" });
  
  const propose = useMutation({"""

new_state = """  const queryClient = useQueryClient();
  const [matrix, setMatrix] = useState({});
  const [form, setForm] = useState({ proposed_fee: "", moving_to_class: lead.moving_to_class || STUDENT_CLASSES[0], course: STUDENT_COURSES[0], batch_name: "", notes: "" });

  useEffect(() => {
    erp.getFeeMatrix().then(res => setMatrix(res.matrix || {}));
  }, []);

  useEffect(() => {
    if (form.moving_to_class && form.course && matrix[form.moving_to_class]?.[form.course] !== undefined) {
      setForm(prev => ({ ...prev, proposed_fee: matrix[form.moving_to_class][form.course] }));
    }
  }, [form.moving_to_class, form.course, matrix]);
  
  const propose = useMutation({"""
content = content.replace(old_state, new_state)

# Replace inputs
old_inputs = """        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Target Class *</label>
        <input required value={form.moving_to_class} onChange={e => setForm({...form, moving_to_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Proposed Total Fee (₹) *</label>
        <input required type="number" min="0" value={form.proposed_fee} onChange={e => setForm({...form, proposed_fee: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>"""

new_inputs = """        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Target Class *</label>
            <select required value={form.moving_to_class} onChange={e => setForm({...form, moving_to_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Course *</label>
            <select required value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              {STUDENT_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Proposed Total Fee (₹) *</label>
        <input required type="number" min="0" readOnly value={form.proposed_fee} className="w-full p-2 text-sm border border-border bg-muted/50 rounded font-bold text-emerald-600" /></div>"""

content = content.replace(old_inputs, new_inputs)

with open("src/pages/erp/modals/LeadProposeModal.jsx", "w") as f:
    f.write(content)
print("Done patching LeadProposeModal")
