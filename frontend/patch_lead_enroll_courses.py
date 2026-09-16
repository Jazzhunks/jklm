with open("src/pages/erp/modals/LeadEnrollModal.jsx", "r") as f:
    content = f.read()

import re

# Update imports
content = content.replace('STUDENT_CLASSES, STUDENT_COURSES, isSuper }', 'STUDENT_CLASSES, STUDENT_COURSES, isSuper, getValidCoursesForClass }')

# Update class onChange
old_class_select = r'<select required value=\{form.current_class\} onChange=\{e => setForm\(\{\.\.\.form, current_class: e\.target\.value\}\)\} className="w-full p-2 text-sm border border-border bg-card rounded">'
new_class_select = """<select required value={form.current_class} onChange={e => {
              const newClass = e.target.value;
              const valid = getValidCoursesForClass(newClass);
              const newCourse = valid.includes(form.course) ? form.course : valid[0];
              setForm({...form, current_class: newClass, course: newCourse});
            }} className="w-full p-2 text-sm border border-border bg-card rounded">"""
content = re.sub(old_class_select, new_class_select, content)

# Update course map
old_course_map = r'\{STUDENT_COURSES\.map\(c => <option key=\{c\} value=\{c\}>\{c\}</option>\)\}'
new_course_map = '{getValidCoursesForClass(form.current_class).map(c => <option key={c} value={c}>{c}</option>)}'
content = re.sub(old_course_map, new_course_map, content)

with open("src/pages/erp/modals/LeadEnrollModal.jsx", "w") as f:
    f.write(content)
print("Done patching LeadEnrollModal")
