import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
import qrcode
from PIL import Image

def draw_single_card_on_canvas(c, x_offset, y_offset, w, h, data):
    # This draws one unfolded card at (x_offset, y_offset)
    # The card has a top half (front) and bottom half (back inverted)
    # y_offset is the bottom-left corner of the unfolded card.
    
    # Top Half:
    front_y = y_offset + h/2
    front_h = h/2
    
    # Blue header
    c.setFillColorRGB(0.25, 0.45, 0.75) # Blueish
    c.rect(x_offset, front_y + front_h - 30*mm, w, 30*mm, stroke=0, fill=1)
    
    # unacademy logo text (white pill)
    c.setFillColorRGB(1, 1, 1)
    c.roundRect(x_offset + 10*mm, front_y + front_h - 10*mm, w - 20*mm, 6*mm, 3*mm, stroke=0, fill=1)
    c.setFillColorRGB(0.2, 0.7, 0.3)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x_offset + w/2, front_y + front_h - 8.5*mm, "unacademy")
    
    # Session text
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(x_offset + w/2, front_y + front_h - 16*mm, "Session : 2026 - 27")
    
    # Photo placeholder (circle)
    c.setFillColorRGB(0.9, 0.9, 0.9)
    c.circle(x_offset + w/2, front_y + front_h - 30*mm, 12*mm, stroke=0, fill=1)
    
    # Name, course, ID
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(x_offset + w/2, front_y + front_h - 50*mm, data['name'])
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x_offset + w/2, front_y + front_h - 58*mm, data['course'])
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x_offset + w/2, front_y + front_h - 66*mm, data['student_no'])
    
    # Bottom Half (Inverted)
    back_y = y_offset
    back_h = h/2
    
    # We can rotate the canvas to draw the back inverted easily.
    c.saveState()
    c.translate(x_offset + w/2, back_y + back_h/2)
    c.rotate(180)
    # Now (0,0) is the center of the bottom half. Bottom-left is (-w/2, -back_h/2)
    
    # Blue footer (which is now top of inverted)
    c.setFillColorRGB(0.25, 0.45, 0.75)
    c.rect(-w/2, back_h/2 - 25*mm, w, 25*mm, stroke=0, fill=1)
    
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica", 6)
    c.drawCentredString(0, back_h/2 - 10*mm, "UNACADEMY CENTRE")
    c.drawCentredString(0, back_h/2 - 15*mm, "PARRAYPORA")
    
    # Icon silhouette (just a simple shape for placeholder)
    c.circle(0, back_h/2 - 20*mm, 3*mm, stroke=0, fill=1)
    
    # QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data(data['student_no'])
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    qr_buf = io.BytesIO()
    img.save(qr_buf, format='PNG')
    qr_buf.seek(0)
    
    from reportlab.lib.utils import ImageReader
    qr_img = ImageReader(qr_buf)
    
    qr_size = 35*mm
    c.drawImage(qr_img, -qr_size/2, -back_h/2 + 5*mm, width=qr_size, height=qr_size)
    
    c.restoreState()
    
    # Draw cut lines
    c.setStrokeColorRGB(0.5, 0.5, 0.5)
    c.setDash(2, 2)
    c.rect(x_offset, y_offset, w, h, stroke=1, fill=0)
    # Fold line
    c.line(x_offset, y_offset + h/2, x_offset + w, y_offset + h/2)


c = canvas.Canvas("test_id.pdf", pagesize=landscape(A4))
w = 297*mm / 5
h = 170*mm

# Center vertically
y_start = (210*mm - h) / 2

for i in range(5):
    draw_single_card_on_canvas(c, i * w, y_start, w, h, {
        "name": f"STUDENT {i}",
        "course": "NEET BATCH",
        "student_no": f"1000{i}"
    })
c.save()
print("Saved test_id.pdf")
