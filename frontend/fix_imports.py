with open("src/pages/erp/ErpStudents.jsx", "r") as f:
    content = f.read()

import re
# Find the import from "@/lib/erpApi" and ensure STUDENT_CLASSES and STUDENT_COURSES are in it
import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"@/lib/erpApi";', content)
if import_match:
    imports = import_match.group(1).split(",")
    imports = [i.strip() for i in imports]
    if "STUDENT_CLASSES" not in imports:
        imports.append("STUDENT_CLASSES")
    if "STUDENT_COURSES" not in imports:
        imports.append("STUDENT_COURSES")
    
    new_import = f'import {{ {", ".join(imports)} }} from "@/lib/erpApi";'
    content = content[:import_match.start()] + new_import + content[import_match.end():]

with open("src/pages/erp/ErpStudents.jsx", "w") as f:
    f.write(content)
print("Done fixing ErpStudents.jsx imports")
