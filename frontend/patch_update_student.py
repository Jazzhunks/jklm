with open("../backend/erp_routes.py", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if 'if user["role"] == "counsellor":' in line:
        skip = True
        continue
    if skip:
        if 'raise HTTPException(403' in line and 'Counsellors cannot edit student records' in line:
            skip = False
            continue
        skip = False

    if 'patch = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}' in line:
        new_lines.append(line)
        new_lines.append('        if user["role"] != "super_admin":\n')
        new_lines.append('            patch.pop("total_fee", None)\n')
        new_lines.append('            patch.pop("scholarship_percent", None)\n')
        new_lines.append('            patch.pop("discount", None)\n')
    else:
        new_lines.append(line)

with open("../backend/erp_routes.py", "w") as f:
    f.writelines(new_lines)
print("Done patching backend update_student")
