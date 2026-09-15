with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

content = content.replace("                c.circle(0, back_h/2 - 19.5*mm, 2.5*mm, stroke=0, fill=1)", "        c.circle(0, back_h/2 - 19.5*mm, 2.5*mm, stroke=0, fill=1)")

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
