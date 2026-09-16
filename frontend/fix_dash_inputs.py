import re
with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

# Fix Class
class_regex = re.compile(r'<div>\s*<label className=\{labelCls\}>Current Class \*</label>.*?</div>', re.DOTALL)
new_class = """<div>
            <label className={labelCls}>Current Class *</label>
            <select required value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} className={inputCls}>
              {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>"""
content = class_regex.sub(new_class, content, count=1)

# Fix Course
course_regex = re.compile(r'<div>\s*<label className=\{labelCls\}>Course \*</label>.*?</div>', re.DOTALL)
new_course = """<div>
            <label className={labelCls}>Course *</label>
            <select required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className={inputCls}>
              {STUDENT_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>"""
content = course_regex.sub(new_course, content, count=1)

# Fix Fee
fee_regex = re.compile(r'<div>\s*<label className=\{labelCls\}>Gross Fee \(₹\) \*</label>.*?</div>', re.DOTALL)
new_fee = """<div>
            <label className={labelCls}>Gross Fee (₹) *</label>
            <input type="number" required min="0" readOnly={!isSuper(erpUser)} value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className={`${inputCls} ${!isSuper(erpUser) ? 'bg-muted/50 text-muted-foreground' : ''}`} />
          </div>"""
content = fee_regex.sub(new_fee, content, count=1)

# Also ensure `filteredCourses` is removed if it's there
content = re.sub(r'const filteredCourses = .*?;\s*', '', content)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done fixing ErpDashboard inputs")
