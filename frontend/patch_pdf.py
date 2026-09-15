import re

# 1. Update erp_routes.py
with open("../backend/erp_routes.py", "r") as f:
    erp_content = f.read()

erp_old = """            students_data.append({
                "full_name": s.get("full_name"),
                "student_no": s.get("student_no"),
                "enrollment_number": s.get("enrollment_number"),
                "course": c.get("title") or s.get("batch") or "COURSE",
                "branch": b.get("name"),
                "photo_bytes": photo_bytes
            })"""

erp_new = """            students_data.append({
                "full_name": s.get("full_name"),
                "student_no": s.get("student_no"),
                "enrollment_number": s.get("enrollment_number"),
                "course": c.get("title") or s.get("batch") or "COURSE",
                "current_class": s.get("current_class") or "",
                "branch": b.get("name"),
                "photo_bytes": photo_bytes
            })"""

erp_content = erp_content.replace(erp_old, erp_new)

with open("../backend/erp_routes.py", "w") as f:
    f.write(erp_content)

# 2. Update pdf_client.py
with open("../backend/pdf_client.py", "r") as f:
    pdf_content = f.read()

pdf_old_color = """        c.setFillColorRGB(0.24, 0.44, 0.70)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 10.5*mm, "unacademy")"""

pdf_new_color = """        c.setFillColorRGB(0.04, 0.76, 0.43) # unacademy green
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 10.5*mm, "unacademy")"""

pdf_content = pdf_content.replace(pdf_old_color, pdf_new_color)

pdf_old_text = """        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 55*mm, (data.get("full_name") or "").upper())
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 62*mm, (data.get("course") or "").upper())
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 68*mm, data.get("enrollment_number") or data.get("student_no") or "")"""

pdf_new_text = """        course_str = (data.get("course") or "").upper()
        class_str = (data.get("current_class") or "").upper()
        if class_str and course_str:
            display_course = f"{course_str} ({class_str})"
        elif class_str:
            display_course = class_str
        else:
            display_course = course_str

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 52*mm, (data.get("full_name") or "").upper())
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 58*mm, display_course)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 64*mm, data.get("enrollment_number") or data.get("student_no") or "")"""

pdf_content = pdf_content.replace(pdf_old_text, pdf_new_text)

with open("../backend/pdf_client.py", "w") as f:
    f.write(pdf_content)

