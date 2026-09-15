with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

import re

# Update photo radius
old_photo = "        photo_r = 18 * mm"
new_photo = "        photo_r = (1.0941 * inch) / 2.0"
content = content.replace(old_photo, new_photo)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
