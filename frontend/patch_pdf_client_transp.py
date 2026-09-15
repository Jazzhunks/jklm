import os

with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

content = content.replace('logo_path = os.path.join(os.path.dirname(__file__), "white_logo_cropped.png")', 'logo_path = os.path.join(os.path.dirname(__file__), "white_logo_transparent.png")')

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
