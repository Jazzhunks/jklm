import re

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# 1. Adjust QR Y position to give more breathing room at the bottom of the white section
content = content.replace("qr_y_center = face_h/2 - 20*mm", "qr_y_center = face_h/2 - 18.5*mm")

# 2. Adjust LUID Y position relative to new QR position
content = content.replace("c.drawCentredString(0, qr_y_center - 21*mm, f\"LUID: {luid}\" if luid else \"\")", "c.drawCentredString(0, qr_y_center - 20.5*mm, f\"LUID: {luid}\" if luid else \"\")")

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
