with open("../backend/erp_pdf.py", "r") as f:
    content = f.read()

# 1. Update Thermal Header to match A4
old_thermal_header = """    c.setFillColor(TEXT)
    c.drawCentredString(W / 2.0, y, "NORTHEND EDUCATIONAL WORLD")
    y -= 3.8 * mm

    c.setFont("Helvetica", 6.5)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2.0, y, "Unacademy Kashmir")
    y -= 3.4 * mm

    b_name = branch.get("name") or "Head Office"
    b_addr = (branch.get("address") or "Parraypora, Srinagar - 190005")[:42]
    c.drawCentredString(W / 2.0, y, f"{b_name} - {b_addr}")
    y -= 3.2 * mm"""
new_thermal_header = """    c.setFillColor(TEXT)
    c.drawCentredString(W / 2.0, y, "NORTHEND EDUCATIONAL WORLD")
    y -= 3.8 * mm

    c.setFont("Helvetica", 6.5)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2.0, y, "Unacademy Kashmir")
    y -= 3.4 * mm

    c.drawCentredString(W / 2.0, y, "Head Office: I.G Road Parraypora, Srinagar - 190005")
    y -= 3.2 * mm
    c.drawCentredString(W / 2.0, y, "info@northendedu.com | www.northendedu.com")
    y -= 3.2 * mm"""

content = content.replace(old_thermal_header, new_thermal_header)

# 2. Update course_title calculation in download_receipt in erp_routes.py!
# We don't touch erp_pdf.py for course_title, we change it where it's passed!
with open("../backend/erp_pdf.py", "w") as f:
    f.write(content)
print("Updated erp_pdf.py")

