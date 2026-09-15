import os
logo_path = "../backend/logo.svg"
if os.path.exists(logo_path):
    with open(logo_path, "r") as f:
        svg_content = f.read()
    
    # Replace fills
    import re
    svg_content = re.sub(r'fill="#[0-9A-Fa-f]{6}"', 'fill="#FFFFFF"', svg_content)
    
    white_logo_path = "../backend/white_logo.svg"
    with open(white_logo_path, "w") as f:
        f.write(svg_content)
    print("Created white_logo.svg")
