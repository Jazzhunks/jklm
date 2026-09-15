with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_err = """        if not merchant_id or not imei:
            raise HTTPException(400, "Pine Labs is not configured for this branch. Please add Merchant ID and EDC IMEI in Branch Settings.")"""

new_err = """        if not merchant_id or not imei:
            raise HTTPException(400, "Pine Labs is not configured for this branch. Please add POS ID and Serial No in Branch Settings.")"""

content = content.replace(old_err, new_err)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching backend error message")
