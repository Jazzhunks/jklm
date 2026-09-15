import os
with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# Front panel modification
front_old = """        # 2. Logo Unacademy (inside white pill)
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
            c.drawCentredString(x_center, front_top - 13.5*mm, "unacademy")"""

front_new = """        # 2. Logo Unacademy (White color, directly on blue header)
        try:
            from svglib.svglib import svg2rlg
            from reportlab.graphics import renderPDF
            import os
            logo_path = os.path.join(os.path.dirname(__file__), "white_logo.svg")
            logo_drawing = svg2rlg(logo_path)
            if logo_drawing:
                target_w = 24 * mm
                scale = target_w / logo_drawing.width
                logo_drawing.scale(scale, scale)
                logo_drawing.width = target_w
                logo_drawing.height = logo_drawing.height * scale
                renderPDF.draw(logo_drawing, c, x_center - target_w/2, front_top - 15*mm)
            else:
                raise Exception("Empty logo")
        except Exception as e:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(x_center, front_top - 13.5*mm, "unacademy")"""

content = content.replace(front_old, front_new)

# Back panel modification
back_old = """        # 3. Logo (Unacademy Logo)
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
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")"""

back_new = """        # 3. Logo (Unacademy Logo, white color directly on blue background)
        logo_y = qr_y_center - 32*mm
        try:
            if logo_drawing: # reused from front
                renderPDF.draw(logo_drawing, c, -target_w/2, logo_y - (logo_drawing.height / 2.0))
        except Exception:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")"""

content = content.replace(back_old, back_new)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
