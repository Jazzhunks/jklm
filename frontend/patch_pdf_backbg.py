import re

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

old_back_panel = """        # Fill whole back panel with blue for a unified clean look
        c.setFillColorRGB(*blue_color)
        c.rect(-card_w/2, -face_h/2, card_w, face_h, stroke=0, fill=1)
        
        # Layout sequence: Qr Code -> LUID -> Logo -> Unacademy Centre -> Centre Name
        
        # 1. QR Code (near top of inverted back panel)
        qr_y_center = face_h/2 - 20*mm
        qr_data = data.get("enrollment_number") or data.get("student_no") or ""
        if qr_data:
            # Increased border to 4 (standard quiet zone) so scanners can isolate it from the blue background
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            qr_buf = io.BytesIO()
            img.save(qr_buf, format='PNG')
            qr_buf.seek(0)
            qr_img = ImageReader(qr_buf)
            # Increased size to 35x35mm for easier scanning
            c.drawImage(qr_img, -17.5*mm, qr_y_center - 17.5*mm, width=35*mm, height=35*mm)
            
        # 2. LUID
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 7)
        luid = data.get("luid")
        c.drawCentredString(0, qr_y_center - 20*mm, f"LUID: {luid}" if luid else "")
        
        # 3. Logo (Unacademy Logo, white color PNG directly on blue background)
        logo_y = qr_y_center - 32*mm
        try:
            if logo_img: # reused from front
                # Draw the cropped image centered
                c.drawImage(logo_img, -target_w/2, logo_y - target_h/2, target_w, target_h, preserveAspectRatio=True, mask="auto")
        except Exception:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")
            
        # 4. Unacademy Centre
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0, logo_y - 15*mm, "UNACADEMY CENTRE")
        
        # 5. Centre Name
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(0, logo_y - 20*mm, (data.get("branch") or "PARRAYPORA").upper())"""

new_back_panel = """        # Fill top half of inverted back panel (QR code area) with white
        c.setFillColorRGB(1, 1, 1)
        c.rect(-card_w/2, 0, card_w, face_h/2, stroke=0, fill=1)
        
        # Fill bottom half of inverted back panel (Branding area) with blue
        c.setFillColorRGB(*blue_color)
        c.rect(-card_w/2, -face_h/2, card_w, face_h/2, stroke=0, fill=1)
        
        # Layout sequence: Qr Code -> LUID -> Logo -> Unacademy Centre -> Centre Name
        
        # 1. QR Code (near top of inverted back panel, on white background)
        qr_y_center = face_h/2 - 20*mm
        qr_data = data.get("enrollment_number") or data.get("student_no") or ""
        if qr_data:
            # Reverted to border=1 since background is white now, no artificial padding needed
            qr = qrcode.QRCode(version=1, box_size=10, border=1)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            qr_buf = io.BytesIO()
            img.save(qr_buf, format='PNG')
            qr_buf.seek(0)
            qr_img = ImageReader(qr_buf)
            c.drawImage(qr_img, -17.5*mm, qr_y_center - 17.5*mm, width=35*mm, height=35*mm)
            
        # 2. LUID
        # LUID text color must be black since it's on white background
        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 7)
        luid = data.get("luid")
        c.drawCentredString(0, qr_y_center - 21*mm, f"LUID: {luid}" if luid else "")
        
        # 3. Logo (Unacademy Logo, white color PNG directly on blue background)
        logo_y = -8 * mm
        try:
            if logo_img: # reused from front
                # Draw the cropped image centered
                c.drawImage(logo_img, -target_w/2, logo_y - target_h/2, target_w, target_h, preserveAspectRatio=True, mask="auto")
        except Exception:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")
            
        # 4. Unacademy Centre
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0, logo_y - 14*mm, "UNACADEMY CENTRE")
        
        # 5. Centre Name
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(0, logo_y - 20*mm, (data.get("branch") or "PARRAYPORA").upper())"""

content = content.replace(old_back_panel, new_back_panel)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
