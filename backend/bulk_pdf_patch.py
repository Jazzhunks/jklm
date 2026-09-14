import sys

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

bulk_func = """
def bulk_id_card_pdf(students_data: list) -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import mm
    from reportlab.lib.utils import ImageReader
    import qrcode
    import io

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    
    W_A4, H_A4 = landscape(A4)
    card_w = W_A4 / 5.0
    card_h = 170 * mm
    y_start = (H_A4 - card_h) / 2.0
    
    for idx, data in enumerate(students_data):
        if idx > 0 and idx % 5 == 0:
            c.showPage()
            
        col = idx % 5
        x_offset = col * card_w
        y_offset = y_start
        
        # Draw front (top half)
        front_y = y_offset + card_h / 2
        front_h = card_h / 2
        
        c.setFillColorRGB(0.24, 0.44, 0.70)
        c.rect(x_offset, front_y + front_h - 35*mm, card_w, 35*mm, stroke=0, fill=1)
        
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x_offset + 10*mm, front_y + front_h - 12*mm, card_w - 20*mm, 6*mm, 3*mm, stroke=0, fill=1)
        
        c.setFillColorRGB(0.24, 0.44, 0.70)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 10.5*mm, "unacademy")
        
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 18*mm, "Session : 2026 - 27")
        
        photo_bytes = data.get("photo_bytes")
        if photo_bytes:
            try:
                c.saveState()
                path = c.beginPath()
                path.circle(x_offset + card_w/2, front_y + front_h - 35*mm, 12*mm)
                c.clipPath(path, stroke=0, fill=0)
                img = ImageReader(io.BytesIO(photo_bytes))
                c.drawImage(img, x_offset + card_w/2 - 12*mm, front_y + front_h - 35*mm - 12*mm, 24*mm, 24*mm, preserveAspectRatio=True, mask="auto")
                c.restoreState()
            except Exception:
                pass
        else:
            c.setFillColorRGB(0.9, 0.9, 0.9)
            c.circle(x_offset + card_w/2, front_y + front_h - 35*mm, 12*mm, stroke=0, fill=1)
            
        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 55*mm, (data.get("full_name") or "").upper())
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 62*mm, (data.get("course") or "").upper())
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 68*mm, data.get("enrollment_number") or data.get("student_no") or "")
        
        # Draw back (bottom half, inverted)
        back_y = y_offset
        back_h = card_h / 2
        
        c.saveState()
        c.translate(x_offset + card_w/2, back_y + back_h/2)
        c.rotate(180)
        
        c.setFillColorRGB(0.24, 0.44, 0.70)
        c.rect(-card_w/2, back_h/2 - 25*mm, card_w, 25*mm, stroke=0, fill=1)
        
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica", 6)
        c.drawCentredString(0, back_h/2 - 10*mm, "UNACADEMY CENTRE")
        c.drawCentredString(0, back_h/2 - 15*mm, (data.get("branch") or "PARRAYPORA").upper())
        
        c.circle(0, back_h/2 - 22*mm, 4*mm, stroke=0, fill=1)
        
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
            qr_size = 35*mm
            c.drawImage(qr_img, -qr_size/2, -back_h/2 + 5*mm, width=qr_size, height=qr_size)
        
        c.restoreState()
        
        c.setStrokeColorRGB(0.5, 0.5, 0.5)
        c.setDash(2, 2)
        c.rect(x_offset, y_offset, card_w, card_h, stroke=1, fill=0)
        c.line(x_offset, y_offset + card_h/2, x_offset + card_w, y_offset + card_h/2)
        
    c.save()
    return buf.getvalue()
"""

with open("../backend/pdf_client.py", "w") as f:
    f.write(content + "\n" + bulk_func)
