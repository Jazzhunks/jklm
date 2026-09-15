import os

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# Replace front panel logo block
front_old = """        # 2. Logo Unacademy (White color, directly on blue header)
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

front_new = """        # 2. Logo Unacademy (White color PNG, directly on blue header)
        try:
            import os
            from reportlab.lib.utils import ImageReader
            logo_path = os.path.join(os.path.dirname(__file__), "white_logo.png")
            logo_img = ImageReader(logo_path)
            target_w = 24 * mm
            # Image is 600x600 padded square
            c.drawImage(logo_img, x_center - target_w/2, front_top - 19*mm, target_w, target_w, preserveAspectRatio=True, mask="auto")
        except Exception as e:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(x_center, front_top - 13.5*mm, "unacademy")"""

content = content.replace(front_old, front_new)

# Replace back panel logo block
back_old = """        # 3. Logo (Unacademy Logo, white color directly on blue background)
        logo_y = qr_y_center - 32*mm
        try:
            if logo_drawing: # reused from front
                renderPDF.draw(logo_drawing, c, -target_w/2, logo_y - (logo_drawing.height / 2.0))
        except Exception:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")"""

back_new = """        # 3. Logo (Unacademy Logo, white color PNG directly on blue background)
        logo_y = qr_y_center - 32*mm
        try:
            if logo_img: # reused from front
                # Draw the square image centered
                c.drawImage(logo_img, -target_w/2, logo_y - target_w/2, target_w, target_w, preserveAspectRatio=True, mask="auto")
        except Exception:
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(0, logo_y - 1*mm, "unacademy")"""

content = content.replace(back_old, back_new)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
