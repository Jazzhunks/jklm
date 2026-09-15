with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

import re

new_bulk = """def bulk_id_card_pdf(students_data: list) -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import inch, mm
    from reportlab.lib.utils import ImageReader
    import qrcode
    import io

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    
    # Exact Specifications
    W_A4, H_A4 = landscape(A4)
    
    card_w = 2.1319 * inch
    face_h = 3.2442 * inch
    spine_h = 0.2297 * inch
    card_h = (face_h * 2) + spine_h
    
    # Center the 5 cards horizontally and vertically
    total_w = card_w * 5
    margin_x = (W_A4 - total_w) / 2.0
    margin_y = (H_A4 - card_h) / 2.0
    
    blue_color = (0.231, 0.443, 0.792) # #3B71CA
    
    for idx, data in enumerate(students_data):
        if idx > 0 and idx % 5 == 0:
            c.showPage()
            
        col = idx % 5
        x_left = margin_x + (col * card_w)
        x_center = x_left + (card_w / 2.0)
        y_offset = margin_y
        
        # --- GUIDES ---
        c.setStrokeColorRGB(0.8, 0.8, 0.8)
        c.setDash(2, 2)
        # Bounding box for the whole unfolded card
        c.rect(x_left, y_offset, card_w, card_h, stroke=1, fill=0)
        # Spine lines (two fold lines)
        c.line(x_left, y_offset + face_h, x_left + card_w, y_offset + face_h)
        c.line(x_left, y_offset + face_h + spine_h, x_left + card_w, y_offset + face_h + spine_h)
        c.setDash()
        
        # --- FRONT PANEL ---
        front_base = y_offset + face_h + spine_h
        front_top = front_base + face_h
        
        # 1. Header Band (Blue background for top portion)
        c.setFillColorRGB(*blue_color)
        c.rect(x_left, front_top - 40*mm, card_w, 40*mm, stroke=0, fill=1)
        
        # 2. Logo Unacademy (inside white pill)
        pill_w = 28 * mm
        pill_h = 6 * mm
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x_center - pill_w/2, front_top - 15*mm, pill_w, pill_h, 3*mm, stroke=0, fill=1)
        
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
                renderPDF.draw(logo_drawing, c, x_center - target_w/2, front_top - 14*mm)
            else:
                raise Exception("Empty logo")
        except Exception as e:
            c.setFillColorRGB(*blue_color)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(x_center, front_top - 13.5*mm, "unacademy")
            
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(x_center, front_top - 22*mm, "Session : 2026 - 27")
        
        # 3. Photo
        photo_r = 18 * mm
        photo_y = front_top - 44 * mm # centered directly on the border of the blue header (which ends at -40mm)
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
            
        # 4. Text Block (Name, Class, Enrollment)
        course_str = data.get("course")
        class_str = data.get("current_class")
        display_course = get_class_display(class_str, course_str)

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(x_center, front_base + 15*mm, (data.get("full_name") or "").upper())
        
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_center, front_base + 9*mm, display_course)
        
        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_center, front_base + 3.5*mm, data.get("enrollment_number") or data.get("student_no") or "")
        
        # --- BACK PANEL (Inverted) ---
        c.saveState()
        # Translate to the center of the BACK panel
        c.translate(x_center, y_offset + face_h/2.0)
        c.rotate(180)
        
        # We are now in local coords where (0,0) is center of back panel.
        # Top of back panel is +face_h/2, Bottom is -face_h/2.
        
        # Fill whole back panel with blue for a unified clean look
        c.setFillColorRGB(*blue_color)
        c.rect(-card_w/2, -face_h/2, card_w, face_h, stroke=0, fill=1)
        
        # Layout sequence: Qr Code -> LUID -> Logo -> Unacademy Centre -> Centre Name
        
        # 1. QR Code (near top of inverted back panel)
        qr_y_center = face_h/2 - 20*mm
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
            c.drawImage(qr_img, -15*mm, qr_y_center - 15*mm, width=30*mm, height=30*mm)
            
        # 2. LUID
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 7)
        luid = data.get("luid")
        c.drawCentredString(0, qr_y_center - 20*mm, f"LUID: {luid}" if luid else "")
        
        # 3. Logo (Unacademy Logo)
        # We can draw the same white pill or just the logo. Let's draw the white pill with logo.
        logo_y = qr_y_center - 32*mm
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(-pill_w/2, logo_y - pill_h/2, pill_w, pill_h, 3*mm, stroke=0, fill=1)
        try:
            if logo_drawing: # reused from front
                renderPDF.draw(logo_drawing, c, -target_w/2, logo_y - pill_h/2 + 1*mm)
        except Exception:
            c.setFillColorRGB(*blue_color)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")
            
        # 4. Unacademy Centre
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0, logo_y - 15*mm, "UNACADEMY CENTRE")
        
        # 5. Centre Name
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(0, logo_y - 20*mm, (data.get("branch") or "PARRAYPORA").upper())
        
        c.restoreState()
        
    c.save()
    return buf.getvalue()
"""

# Replace the old bulk_id_card_pdf
content = re.sub(r'def bulk_id_card_pdf.*?return buf\.getvalue\(\)\n', new_bulk, content, flags=re.DOTALL)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
