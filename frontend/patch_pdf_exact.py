with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

import re

new_bulk = """def bulk_id_card_pdf(students_data: list) -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import mm
    from reportlab.lib.utils import ImageReader
    import qrcode
    import io

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    
    # Specifications
    W_A4, H_A4 = landscape(A4)
    margin_x = 6.75 * mm
    margin_y = 20 * mm
    card_w = 54 * mm
    card_h = 170 * mm
    fold_y = 105 * mm
    blue_color = (0.231, 0.443, 0.792) # #3B71CA
    
    for idx, data in enumerate(students_data):
        if idx > 0 and idx % 5 == 0:
            c.showPage()
            
        col = idx % 5
        x_left = margin_x + (col * card_w)
        x_center = x_left + (card_w / 2.0)
        
        # --- GUIDES ---
        c.setStrokeColorRGB(0.8, 0.8, 0.8)
        c.setDash(2, 2)
        c.rect(x_left, margin_y, card_w, card_h, stroke=1, fill=0)
        c.line(x_left, fold_y, x_left + card_w, fold_y)
        c.setDash()
        
        # --- FRONT PANEL (105mm to 190mm) ---
        # 1. Header Band
        c.setFillColorRGB(*blue_color)
        c.rect(x_left, 150*mm, card_w, 40*mm, stroke=0, fill=1)
        
        # White pill
        pill_w = 28 * mm
        pill_h = 6 * mm
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x_center - pill_w/2, 175*mm, pill_w, pill_h, 3*mm, stroke=0, fill=1)
        
        c.setFillColorRGB(*blue_color)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(x_center, 176.5*mm, "unacademy")
        
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(x_center, 168*mm, "Session : 2026 - 27")
        
        # 2. Profile Picture
        photo_y = 146 * mm
        photo_r = 18 * mm
        c.setLineWidth(1.5)
        c.setStrokeColorRGB(1, 1, 1)
        
        photo_bytes = data.get("photo_bytes")
        if photo_bytes:
            try:
                c.saveState()
                path = c.beginPath()
                path.circle(x_center, photo_y, photo_r)
                c.clipPath(path, stroke=1, fill=0)
                img = ImageReader(io.BytesIO(photo_bytes))
                c.drawImage(img, x_center - photo_r, photo_y - photo_r, photo_r*2, photo_r*2, preserveAspectRatio=True, mask="auto")
                c.restoreState()
                c.circle(x_center, photo_y, photo_r, stroke=1, fill=0)
            except Exception:
                c.setFillColorRGB(0.9, 0.9, 0.9)
                c.circle(x_center, photo_y, photo_r, stroke=1, fill=1)
        else:
            c.setFillColorRGB(0.9, 0.9, 0.9)
            c.circle(x_center, photo_y, photo_r, stroke=1, fill=1)
            
        # 3. Text Block
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
        c.drawCentredString(x_center, 111*mm, display_course)
        
        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_center, 105.5*mm, data.get("enrollment_number") or data.get("student_no") or "")
        
        # --- BACK PANEL (20mm to 105mm, Inverted) ---
        c.saveState()
        c.translate(x_center, fold_y)
        c.rotate(180)
        
        # Branding Section (Local Y=0 to 40mm -> Page Y=65 to 105)
        c.setFillColorRGB(*blue_color)
        c.rect(-card_w/2, 0, card_w, 40*mm, stroke=0, fill=1)
        
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0, 15*mm, "UNACADEMY CENTRE")
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(0, 22*mm, "PARRAYPORA")
        
        c.circle(0, 31*mm, 3*mm, stroke=0, fill=1)
        c.roundRect(-5*mm, 34*mm, 10*mm, 5*mm, 2*mm, stroke=0, fill=1)
        
        # QR Code Section (Local Y=45 to 85mm -> Page Y=20 to 60)
        c.setFillColorRGB(*blue_color)
        c.rect(-card_w/2, 45*mm, card_w, 40*mm, stroke=0, fill=1)
        
        qr_data = data.get("enrollment_number") or data.get("student_no") or ""
        if qr_data:
            qr = qrcode.QRCode(version=1, box_size=10, border=1)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            qr_buf = io.BytesIO()
            img.save(qr_buf, format='PNG')
            qr_buf.seek(0)
            
            qr_img = ImageReader(qr_buf)
            c.drawImage(qr_img, -15*mm, 50*mm, width=30*mm, height=30*mm)
            
        c.restoreState()
        
    c.save()
    return buf.getvalue()
"""

# Replace the old bulk_id_card_pdf
content = re.sub(r'def bulk_id_card_pdf.*?return buf\.getvalue\(\)\n', new_bulk, content, flags=re.DOTALL)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
