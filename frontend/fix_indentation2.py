with open("../backend/erp_routes.py", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'raise HTTPException(403, "Counsellors cannot create student records directly")' in line:
        if 'if user["role"]' not in lines[i-1]:
            new_lines.append('        if user["role"] == "counsellor":\n')
    elif 'raise HTTPException(403, "Counsellors cannot record payments")' in line:
        if 'if user["role"]' not in lines[i-1]:
            new_lines.append('        if user["role"] == "counsellor":\n')
    elif 'raise HTTPException(403, "Counsellors cannot update student photos")' in line:
        if 'if user["role"]' not in lines[i-1]:
            new_lines.append('        if user["role"] == "counsellor":\n')
    new_lines.append(line)

with open("../backend/erp_routes.py", "w") as f:
    f.writelines(new_lines)
print("Done fixing all indentations")
