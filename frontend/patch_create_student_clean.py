import re
with open("src/pages/erp/ErpStudents.jsx", "r") as f:
    content = f.read()

content = re.sub(r'const \[courses, setCourses\] = useState\(\[\]\);\s*', '', content)
content = re.sub(r'  useEffect\(\(\) => \{\s*api\.get\("/courses"\)\.then.*?catch.*?\);\s*\}, \[\]\);\s*', '', content)
content = re.sub(r'const selectedCourse = courses\.find.*?;\s*', '', content)

with open("src/pages/erp/ErpStudents.jsx", "w") as f:
    f.write(content)
print("Done cleaning CreateStudentModal")
