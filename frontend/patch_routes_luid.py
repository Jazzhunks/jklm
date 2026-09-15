with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old = """                "current_class": s.get("current_class") or "",
                "branch": b.get("name"),"""
new = """                "current_class": s.get("current_class") or "",
                "luid": s.get("luid") or "",
                "branch": b.get("name"),"""

content = content.replace(old, new)
with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
