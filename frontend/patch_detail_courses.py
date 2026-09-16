with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

import re

# Update imports
content = content.replace('import { STUDENT_CLASSES } from "@/lib/erpApi";', 'import { STUDENT_CLASSES, getValidCoursesForClass } from "@/lib/erpApi";')

# Update class onChange (if we ever added course there. Wait, ErpStudentDetail doesn't have course editing in Edit Profile Modal. 
# We checked this earlier: current_class is editable, but course_id is NOT in EditStudentProfileModal).
# Let's verify this quickly.
