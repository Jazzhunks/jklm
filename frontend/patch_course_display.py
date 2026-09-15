import re
with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

# 1. Remove the useEffect for api.get("/courses...")
effect_regex = re.compile(r'  useEffect\(\(\) => \{\s*if \(stmt\?\.student\?\.course_id\) \{\s*api\.get\(\`/courses/\$\{stmt\.student\.course_id\}\`\)\s*\.then\(r => setCourse\(r\.data\)\)\s*\.catch\(\(\) => \{\}\);\s*\}\s*\}, \[stmt\?\.student\?\.course_id\]\);', re.DOTALL)
content = effect_regex.sub('', content)

# 2. Change course?.title to s.course_id
content = content.replace('{course?.title || "—"}', '{s.course_id || "—"}')

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching ErpStudentDetail course UI")
