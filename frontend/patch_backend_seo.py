import os

files_to_check = [
    "../backend/erp_pdf.py",
    "../backend/pdf_client.py",
    "../backend/erp_routes.py"
]

for path in files_to_check:
    if not os.path.exists(path):
        continue
    with open(path, "r") as f:
        content = f.read()
    
    # Standardizations
    content = content.replace("Northend Educational World", "Unacademy")
    content = content.replace("NORTHEND EDUCATIONAL WORLD", "UNACADEMY")
    content = content.replace("Northend Centre", "Unacademy Centre")
    content = content.replace("Northend", "Unacademy")
    content = content.replace("NORTHEND", "UNACADEMY")
    content = content.replace("northendedu.com", "unacademy.com")
    
    with open(path, "w") as f:
        f.write(content)
        
print("Done patching backend SEO branding")
