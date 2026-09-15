with open("src/pages/erp/modals/LeadEnrollModal.jsx", "r") as f:
    content = f.read()

content = content.replace('import { erp } from "@/lib/erpApi";', 'import { erp, STUDENT_CLASSES, STUDENT_COURSES, isSuper } from "@/lib/erpApi";\nimport { useEffect } from "react";\nimport { useAuth } from "@/contexts/AuthContext";')

old_state = """export default function LeadEnrollModal({ lead, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: lead.name || "",
    contact_phone: lead.phone || "",
    current_class: lead.moving_to_class || "",
    batch: lead.proposed_batch || "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: lead.address || "",
    total_fee: lead.proposed_fee || 0,
    deposit_amount: "",
    payment_mode: "cash",
    payment_reference: ""
  });"""

new_state = """export default function LeadEnrollModal({ lead, onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [matrix, setMatrix] = useState({});
  const [form, setForm] = useState({
    full_name: lead.name || "",
    contact_phone: lead.phone || "",
    current_class: lead.moving_to_class || STUDENT_CLASSES[0],
    course: lead.course || STUDENT_COURSES[0],
    batch: lead.proposed_batch || "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: lead.address || "",
    total_fee: lead.proposed_fee || 0,
    deposit_amount: "",
    payment_mode: "cash",
    payment_reference: ""
  });

  useEffect(() => {
    erp.getFeeMatrix().then(res => setMatrix(res.matrix || {}));
  }, []);

  // If super admin changes class/course, auto update fee. Or if no proposed fee was set yet.
  useEffect(() => {
    if (form.current_class && form.course && matrix[form.current_class]?.[form.course] !== undefined) {
      if (!lead.proposed_fee || isSuper(user)) {
        setForm(prev => ({ ...prev, total_fee: matrix[form.current_class][form.course] }));
      }
    }
  }, [form.current_class, form.course, matrix, lead.proposed_fee, user]);"""
content = content.replace(old_state, new_state)

old_inputs = """        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Class *</label>
          <input required value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Batch</label>
          <input value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        </div>"""

new_inputs = """        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Class *</label>
            <select required value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Course *</label>
            <select required value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              {STUDENT_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Batch</label>
          <input value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        </div>"""
content = content.replace(old_inputs, new_inputs)

old_fee = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold block mb-1">Approved Total Fee (₹) *</label>
            <input required type="number" value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded text-emerald-600 font-black" /></div>"""
new_fee = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold block mb-1">Approved Total Fee (₹) *</label>
            <input required type="number" readOnly={!isSuper(user)} value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className={`w-full p-2 text-sm border border-border rounded font-black ${!isSuper(user) ? 'bg-muted/50 text-emerald-600/70' : 'bg-card text-emerald-600'}`} title={!isSuper(user) ? 'Only Super Admin can manually override the configured matrix fee' : ''} /></div>"""
content = content.replace(old_fee, new_fee)

with open("src/pages/erp/modals/LeadEnrollModal.jsx", "w") as f:
    f.write(content)
print("Done patching LeadEnrollModal")
