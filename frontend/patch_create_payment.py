with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_paid_at = """            "paid_at": now_iso(),
        }"""
new_paid_at = """            "paid_at": now_iso(),
            "status": "pending" if payload.mode == "pine_labs_edc" else "paid",
        }"""
content = content.replace(old_paid_at, new_paid_at)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching create_payment")
