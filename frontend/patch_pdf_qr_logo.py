import os

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# 1. Fix Logo Size
logo_old = """            target_w = 24 * mm
            target_h = 4 * mm"""
logo_new = """            target_w = 36 * mm
            target_h = 6 * mm"""
content = content.replace(logo_old, logo_new)

# 2. Fix QR Code Scannability (Border 4 for quiet zone, increase size)
qr_old = """            qr = qrcode.QRCode(version=1, box_size=10, border=1)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            qr_buf = io.BytesIO()
            img.save(qr_buf, format='PNG')
            qr_buf.seek(0)
            qr_img = ImageReader(qr_buf)
            c.drawImage(qr_img, -15*mm, qr_y_center - 15*mm, width=30*mm, height=30*mm)"""

qr_new = """            # Increased border to 4 (standard quiet zone) so scanners can isolate it from the blue background
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            qr_buf = io.BytesIO()
            img.save(qr_buf, format='PNG')
            qr_buf.seek(0)
            qr_img = ImageReader(qr_buf)
            # Increased size to 35x35mm for easier scanning
            c.drawImage(qr_img, -17.5*mm, qr_y_center - 17.5*mm, width=35*mm, height=35*mm)"""

content = content.replace(qr_old, qr_new)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
