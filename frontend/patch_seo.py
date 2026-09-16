import os
import re

files_to_check = [
    "public/index.html",
    "src/pages/Home.jsx",
    "src/pages/Courses.jsx",
    "src/pages/BlogPost.jsx",
    "src/pages/Gallery.jsx",
    "src/pages/wath/WathRegistrationForm.jsx",
    "src/pages/wath/WathSharedSections.jsx",
    "src/pages/Login.jsx",
    "src/pages/Blog.jsx",
    "src/components/Layout.jsx",
    "src/pages/erp/ErpLayout.jsx"
]

def optimize_keywords(content):
    # If the file has meta name="keywords" content="..."
    # We want to replace it with optimized Unacademy keywords
    old_keywords = re.search(r'name="keywords"\s+content="([^"]+)"', content)
    if old_keywords:
        new_kws = "Unacademy, NEET coaching, JEE coaching, CUET preparation, IIT-JEE preparation, Foundation classes, best coaching institute, online learning, competitive exams"
        content = content.replace(f'content="{old_keywords.group(1)}"', f'content="{new_kws}"')
    
    # Also replace any <meta name="description" content="..."> with optimized Unacademy description
    old_desc = re.search(r'name="description"\s+content="([^"]+)"', content)
    if old_desc and "Northend" in old_desc.group(1):
        pass # The global replacement below will handle "Northend" -> "Unacademy"
    
    return content

for path in files_to_check:
    if not os.path.exists(path):
        continue
    with open(path, "r") as f:
        content = f.read()
    
    # Replace strings
    content = content.replace("Northend Educational World", "Unacademy")
    content = content.replace("NORTHEND EDUCATIONAL WORLD", "UNACADEMY")
    content = content.replace("Northend", "Unacademy")
    content = content.replace("northend", "unacademy")
    content = content.replace("northendedu.com", "unacademy.com")
    
    content = optimize_keywords(content)
    
    with open(path, "w") as f:
        f.write(content)
        
print("Done patching SEO")
