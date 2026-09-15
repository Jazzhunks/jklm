import os

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

# Fix front panel logo coords
front_old = """            # Image is 600x600 padded square
            c.drawImage(logo_img, x_center - target_w/2, front_top - 19*mm, target_w, target_w, preserveAspectRatio=True, mask="auto")"""
front_new = """            # Image is 600x600 padded square (the actual logo is tiny in the middle of it)
            # We want the logo's visual center to be at front_top - 14*mm
            # So the square's center should be there. y = (front_top - 14*mm) - target_w/2
            c.drawImage(logo_img, x_center - target_w/2, front_top - 14*mm - target_w/2, target_w, target_w, preserveAspectRatio=True, mask="auto")"""
content = content.replace(front_old, front_new)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
