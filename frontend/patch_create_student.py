with open("src/pages/erp/ErpStudents.jsx", "r") as f:
    content = f.read()

import re

# Add imports for STUDENT_CLASSES and STUDENT_COURSES
content = content.replace('import { erp, isSuper, canManageStudents, API_BASE } from "@/lib/erpApi";', 'import { erp, isSuper, canManageStudents, API_BASE, STUDENT_CLASSES, STUDENT_COURSES } from "@/lib/erpApi";')

# State and Matrix fetching in CreateStudentModal
old_create_state = """function CreateStudentModal({ erpUser, branches, defaultBranchId, onClose, onCreated }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    address: "",
    contact_phone: "",
    contact_email: "",
    emergency_phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    current_class: "",
    school_institute: "",
    board: "CBSE",
    category: "General",
    course_id: "",
    batch: "",
    batch_timing: "Morning",
    course_duration: "1 Year",
    branch_id: defaultBranchId || "",
    admission_date: new Date().toISOString().slice(0, 10),
    total_fee: "",
    scholarship_percent: "0",
    discount: "0",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/courses").then(res => setCourses(res.data.courses || []));
  }, []);"""

new_create_state = """function CreateStudentModal({ erpUser, branches, defaultBranchId, onClose, onCreated }) {
  const [matrix, setMatrix] = useState({});
  const [form, setForm] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    address: "",
    contact_phone: "",
    contact_email: "",
    emergency_phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    current_class: STUDENT_CLASSES[0],
    school_institute: "",
    board: "CBSE",
    category: "General",
    course_id: STUDENT_COURSES[0],
    batch: "",
    batch_timing: "Morning",
    course_duration: "1 Year",
    branch_id: defaultBranchId || "",
    admission_date: new Date().toISOString().slice(0, 10),
    total_fee: "",
    scholarship_percent: "0",
    discount: "0",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
content = content.replace(old_create_state, new_create_state)

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

# Remove `const filteredCourses = ...` since it's no longer used
content = re.sub(r'const filteredCourses = courses.filter.*?;\s*', '', content)

# Read only fee input
old_fee_input = """            <div>
              <label className={labelCls}>Gross Fee (₹) *</label>
              <input type="number" required min="0" value={form.total_fee} onChange={e => setForm(f => ({ ...f, total_fee: e.target.value }))} className={inputCls} />
            </div>"""
new_fee_input = """            <div>
              <label className={labelCls}>Gross Fee (₹) *</label>
              <input type="number" required min="0" readOnly={!isSuper(erpUser)} value={form.total_fee} onChange={e => setForm(f => ({ ...f, total_fee: e.target.value }))} className={`${inputCls} ${!isSuper(erpUser) ? 'bg-muted/50 text-muted-foreground' : ''}`} />
            </div>"""
content = content.replace(old_fee_input, new_fee_input)

with open("src/pages/erp/ErpStudents.jsx", "w") as f:
    f.write(content)
print("Done patching CreateStudentModal")
