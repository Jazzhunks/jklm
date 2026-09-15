import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

m = re.search(r'await db\.erp_attendance\.create_index\(\[\("student_id", 1\), \("scanned_at", -1\)\]\)', content)
if m:
    content = content[:m.end()] + "\n    await db.erp_treasury_transfers.create_index([(\"branch_id\", 1), (\"transfer_date\", -1)])" + content[m.end():]

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
