import os

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# Replace front panel image logic
front_old = """            logo_path = os.path.join(os.path.dirname(__file__), "white_logo.png")
            logo_img = ImageReader(logo_path)
            target_w = 24 * mm
            # Image is 600x600 padded square (the actual logo is tiny in the middle of it)
            # We want the logo's visual center to be at front_top - 14*mm
            # So the square's center should be there. y = (front_top - 14*mm) - target_w/2
            c.drawImage(logo_img, x_center - target_w/2, front_top - 14*mm - target_w/2, target_w, target_w, preserveAspectRatio=True, mask="auto")"""

front_new = """            logo_path = os.path.join(os.path.dirname(__file__), "white_logo_cropped.png")
            logo_img = ImageReader(logo_path)
            target_w = 24 * mm
            target_h = 4 * mm
            # We want the logo's visual center to be at front_top - 14*mm
            c.drawImage(logo_img, x_center - target_w/2, front_top - 14*mm - target_h/2, target_w, target_h, preserveAspectRatio=True, mask="auto")"""

content = content.replace(front_old, front_new)

# Replace back panel image logic
back_old = """        try:
            if logo_img: # reused from front
                # Draw the square image centered
                c.drawImage(logo_img, -target_w/2, logo_y - target_w/2, target_w, target_w, preserveAspectRatio=True, mask="auto")"""

back_new = """        try:
            if logo_img: # reused from front
                # Draw the cropped image centered
                c.drawImage(logo_img, -target_w/2, logo_y - target_h/2, target_w, target_h, preserveAspectRatio=True, mask="auto")"""
content = content.replace(back_old, back_new)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
