import re

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# 1. Class mapping logic
mapping_func = """def get_class_display(current_class, course):
    if not current_class:
        return (course or "").upper()
    c_class = str(current_class).strip().lower()
    c_course = str(course).strip().upper()
    
    is_neet = "NEET" in c_course
    is_iit = "IIT" in c_course or "JEE" in c_course
    suffix = " NEET" if is_neet else (" IIT" if is_iit else "")
    
    if "8" in c_class:
        return "BEGINNER (8TH)"
    elif "9" in c_class:
        return "ADAPT (9TH)"
    elif "10" in c_class:
        return "ELEVATE (10TH)"
    elif "11" in c_class:
        return f"GROWTH{suffix}"
    elif "12" in c_class:
        return f"EXCEL{suffix}"
    elif "drop" in c_class or "13" in c_class:
        return f"CONQUER{suffix}"
    
    return f"{c_course} ({c_class})".upper()

def bulk_id_card_pdf"""

content = content.replace("def bulk_id_card_pdf", mapping_func)

# 2. Inside bulk_id_card_pdf, use mapping and add svglib logic
old_pill = """        # White pill
        pill_w = 28 * mm
        pill_h = 6 * mm
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x_center - pill_w/2, 175*mm, pill_w, pill_h, 3*mm, stroke=0, fill=1)
        
        c.setFillColorRGB(*blue_color)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(x_center, 176.5*mm, "unacademy")"""

new_pill = """        # White pill
        pill_w = 28 * mm
        pill_h = 6 * mm
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x_center - pill_w/2, 175*mm, pill_w, pill_h, 3*mm, stroke=0, fill=1)
        
        try:
            from svglib.svglib import svg2rlg
            from reportlab.graphics import renderPDF
            import os
            logo_path = os.path.join(os.path.dirname(__file__), "logo.svg")
            logo_drawing = svg2rlg(logo_path)
            if logo_drawing:
                target_w = 20 * mm
                scale = target_w / logo_drawing.width
                logo_drawing.scale(scale, scale)
                logo_drawing.width = target_w
                logo_drawing.height = logo_drawing.height * scale
                renderPDF.draw(logo_drawing, c, x_center - target_w/2, 176*mm)
            else:
                raise Exception("Empty logo")
        except Exception as e:
            c.setFillColorRGB(*blue_color)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(x_center, 176.5*mm, "unacademy")"""
content = content.replace(old_pill, new_pill)

# 3. Replace text block for class mapping
old_text = """        # 3. Text Block
        course_str = (data.get("course") or "").upper()
        class_str = (data.get("current_class") or "").upper()
        if class_str and course_str:
            display_course = f"{course_str} ({class_str})"
        elif class_str:
            display_course = class_str
        else:
            display_course = course_str

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(x_center, 117*mm, (data.get("full_name") or "").upper())
        
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_center, 111*mm, display_course)"""

new_text = """        # 3. Text Block
        course_str = data.get("course")
        class_str = data.get("current_class")
        display_course = get_class_display(class_str, course_str)

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(x_center, 117*mm, (data.get("full_name") or "").upper())
        
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_center, 111*mm, display_course)"""
content = content.replace(old_text, new_text)

# 4. Backside: Branch and LUID
old_back_branding = """        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0, 15*mm, "UNACADEMY CENTRE")
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(0, 22*mm, "PARRAYPORA")"""

new_back_branding = """        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0, 15*mm, "UNACADEMY CENTRE")
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(0, 22*mm, (data.get("branch") or "PARRAYPORA").upper())"""
content = content.replace(old_back_branding, new_back_branding)

# Insert LUID printing
old_qr = """            qr_img = ImageReader(qr_buf)
            c.drawImage(qr_img, -15*mm, 50*mm, width=30*mm, height=30*mm)
            
        c.restoreState()"""

new_qr = """            qr_img = ImageReader(qr_buf)
            c.drawImage(qr_img, -15*mm, 47*mm, width=30*mm, height=30*mm)
            
        luid = data.get("luid")
        if luid:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, 80*mm, f"LUID: {luid}")
            
        c.restoreState()"""
content = content.replace(old_qr, new_qr)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)

