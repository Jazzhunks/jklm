import re

with open("src/pages/erp/ErpPayments.jsx", "r") as f:
    content = f.read()

# Current button condition
old_cond = "{isSuper(erpUser) && ("
new_cond = "{(isSuper(erpUser) || erpUser?.role === 'center_manager' || erpUser?.role === 'accountant') && ("

# Let's verify where isSuper(erpUser) && is used for the GST button
# Looking for "Monthly GST Portal"

if "Monthly GST Portal" in content:
    lines = content.splitlines()
    for i, line in enumerate(lines):
        if "Monthly GST Portal" in line:
            # Look backwards for isSuper
            for j in range(i, max(-1, i-10), -1):
                if "{isSuper(erpUser) && (" in lines[j]:
                    lines[j] = lines[j].replace("{isSuper(erpUser) && (", "{(isSuper(erpUser) || erpUser?.role === 'center_manager' || erpUser?.role === 'accountant') && (")
                    break
    content = "\n".join(lines)
    
with open("src/pages/erp/ErpPayments.jsx", "w") as f:
    f.write(content)
