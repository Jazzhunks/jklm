with open("src/pages/erp/modals/FeeMatrixConfigModal.jsx", "r") as f:
    content = f.read()

import re
content = content.replace('STUDENT_CLASSES, STUDENT_COURSES }', 'STUDENT_CLASSES, STUDENT_COURSES, getValidCoursesForClass }')

old_td = r'<td key=\{course\} className="px-4 py-3">\s*<div className="flex items-center gap-2 justify-center">\s*<span className="text-muted-foreground">₹</span>\s*<input\s*type="number"\s*min="0"\s*className="w-24 px-2 py-1\.5 border border-border bg-background rounded text-sm text-right focus:outline-none focus:border-accent"\s*value=\{matrix\[cls\]\?\.\[course\] \|\| ""\}\s*onChange=\{\(e\) => handleChange\(cls, course, e\.target\.value\)\}\s*placeholder="0"\s*/>\s*</div>\s*</td>'

new_td = """<td key={course} className="px-4 py-3">
                        {getValidCoursesForClass(cls).includes(course) ? (
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-muted-foreground">₹</span>
                            <input 
                              type="number"
                              min="0"
                              className="w-24 px-2 py-1.5 border border-border bg-background rounded text-sm text-right focus:outline-none focus:border-accent"
                              value={matrix[cls]?.[course] || ""}
                              onChange={(e) => handleChange(cls, course, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground/30 text-xs italic">N/A</div>
                        )}
                      </td>"""

content = re.sub(old_td, new_td, content)

with open("src/pages/erp/modals/FeeMatrixConfigModal.jsx", "w") as f:
    f.write(content)
print("Done patching FeeMatrixConfigModal")
