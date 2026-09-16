with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

import re

# Update imports
content = content.replace('STUDENT_CLASSES, STUDENT_COURSES }', 'STUDENT_CLASSES, STUDENT_COURSES, getValidCoursesForClass }')

# Update class onChange
old_class_select = r'<select required value=\{form.current_class\} onChange=\{e => setForm\(\{\.\.\.form, current_class: e\.target\.value\}\)\} className=\{inputCls\}>'
new_class_select = """<select required value={form.current_class} onChange={e => {
              const newClass = e.target.value;
              const valid = getValidCoursesForClass(newClass);
              const newCourse = valid.includes(form.course_id) ? form.course_id : valid[0];
              setForm({...form, current_class: newClass, course_id: newCourse});
            }} className={inputCls}>"""
content = re.sub(old_class_select, new_class_select, content)

# Update course map
old_course_map = r'\{STUDENT_COURSES\.map\(c => <option key=\{c\} value=\{c\}>\{c\}</option>\)\}'
new_course_map = '{getValidCoursesForClass(form.current_class).map(c => <option key={c} value={c}>{c}</option>)}'
content = re.sub(old_course_map, new_course_map, content)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done patching ErpDashboard courses")
