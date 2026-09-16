import re
with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

# Fix import
import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"@/lib/erpApi";', content)
if import_match:
    imports = [i.strip() for i in import_match.group(1).split(",")]
    if "STUDENT_CLASSES" not in imports:
        imports.append("STUDENT_CLASSES")
    if "STUDENT_COURSES" not in imports:
        imports.append("STUDENT_COURSES")
    new_import = f'import {{ {", ".join(imports)} }} from "@/lib/erpApi";'
    content = content[:import_match.start()] + new_import + content[import_match.end():]

# Update the modal definition
old_modal_start = """function CreateStudentModal({ erpUser, onClose, onCreated }) {
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    address: "",
    contact_phone: "",
    contact_email: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    current_class: "",
    course_id: "",
    batch: "",
    batch_timing: "",
    course_duration: "",
    branch_id: isSuper(erpUser) ? "" : erpUser.branch_id,
    total_fee: "",
    scholarship_percent: 0,
    discount: 0,
    additional_discount_by: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredCourses = courses.filter(c => ["Foundation", "NEET", "IIT-JEE"].includes(c.category));

  const computeFinalFee = () => {
    const total = parseFloat(form.total_fee) || 0;
    const scholarship = parseFloat(form.scholarship_percent) || 0;
    const discount = parseFloat(form.discount) || 0;
    const scholarshipAmt = total * (scholarship / 100);
    return Math.max(total - scholarshipAmt - discount, 0);
  };

  const finalFee = computeFinalFee();

  useEffect(() => {
    erp.listBranches().then(setBranches);
    api.get("/courses").then(r => setCourses(Array.isArray(r.data) ? r.data : (r.data?.items || []))).catch(() => setCourses([]));
  }, []);"""

new_modal_start = """function CreateStudentModal({ erpUser, onClose, onCreated }) {
  const [branches, setBranches] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [form, setForm] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    address: "",
    contact_phone: "",
    contact_email: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    current_class: STUDENT_CLASSES[0],
    course_id: STUDENT_COURSES[0],
    batch: "",
    batch_timing: "",
    course_duration: "1 Year",
    branch_id: isSuper(erpUser) ? "" : erpUser.branch_id,
    total_fee: "",
    scholarship_percent: 0,
    discount: 0,
    additional_discount_by: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const computeFinalFee = () => {
    const total = parseFloat(form.total_fee) || 0;
    const scholarship = parseFloat(form.scholarship_percent) || 0;
    const discount = parseFloat(form.discount) || 0;
    const scholarshipAmt = total * (scholarship / 100);
    return Math.max(total - scholarshipAmt - discount, 0);
  };

  const finalFee = computeFinalFee();

  useEffect(() => {
    erp.listBranches().then(setBranches);
    erp.getFeeMatrix().then(res => {
      setMatrix(res.matrix || {});
      // Auto-init fee
      if (res.matrix?.[STUDENT_CLASSES[0]]?.[STUDENT_COURSES[0]] !== undefined) {
        setForm(f => ({ ...f, total_fee: res.matrix[STUDENT_CLASSES[0]][STUDENT_COURSES[0]] }));
      }
    });
  }, []);

  useEffect(() => {
    if (form.current_class && form.course_id && matrix[form.current_class]?.[form.course_id] !== undefined) {
      setForm(prev => ({ ...prev, total_fee: matrix[form.current_class][form.course_id] }));
    }
  }, [form.current_class, form.course_id, matrix]);"""
content = content.replace(old_modal_start, new_modal_start)

# Replace inputs
old_class_input = """            <div>
              <label className={labelCls}>Current Class *</label>
              <input type="text" required value={form.current_class} onChange={e => setForm(f => ({ ...f, current_class: e.target.value }))} placeholder="e.g. 11th Science" className={inputCls} />
            </div>"""
new_class_input = """            <div>
              <label className={labelCls}>Current Class *</label>
              <select required value={form.current_class} onChange={e => setForm(f => ({ ...f, current_class: e.target.value }))} className={inputCls}>
                {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>"""
content = content.replace(old_class_input, new_class_input)

old_course_input = """            <div>
              <label className={labelCls}>Course *</label>
              <select required value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} className={inputCls}>
                <option value="">Select Course</option>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>"""
new_course_input = """            <div>
              <label className={labelCls}>Course *</label>
              <select required value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} className={inputCls}>
                {STUDENT_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>"""
content = content.replace(old_course_input, new_course_input)

old_fee_input = """            <div>
              <label className={labelCls}>Gross Fee (₹) *</label>
              <input type="number" required min="0" value={form.total_fee} onChange={e => setForm(f => ({ ...f, total_fee: e.target.value }))} className={inputCls} />
            </div>"""
new_fee_input = """            <div>
              <label className={labelCls}>Gross Fee (₹) *</label>
              <input type="number" required min="0" readOnly={!isSuper(erpUser)} value={form.total_fee} onChange={e => setForm(f => ({ ...f, total_fee: e.target.value }))} className={`${inputCls} ${!isSuper(erpUser) ? 'bg-muted/50 text-muted-foreground' : ''}`} />
            </div>"""
content = content.replace(old_fee_input, new_fee_input)

# Wait, there's another occurrence of selectedCourse in ErpDashboard.jsx? Let's check if the submit function uses it.
# const selectedCourse = courses.find(c => c.id === form.course_id);
submit_old = """    const selectedCourse = courses.find(c => c.id === form.course_id);
    setBusy(true);"""
submit_new = """    setBusy(true);"""
content = content.replace(submit_old, submit_new)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done patching CreateStudentModal in ErpDashboard.jsx")
