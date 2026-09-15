with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

text_find = """        c.setFillColorRGB(0.04, 0.76, 0.43) # unacademy green
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2, front_y + front_h - 10.5*mm, "unacademy")"""

text_replace = """        c.setFillColorRGB(0.04, 0.76, 0.43) # unacademy green
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x_offset + card_w/2 + 2*mm, front_y + front_h - 10.5*mm, "unacademy")
        # Draw small icon placeholder (cup shape approximation)
        icon_x = x_offset + card_w/2 - 12*mm
        icon_y = front_y + front_h - 9*mm
        c.circle(icon_x, icon_y + 0.5*mm, 1.5*mm, stroke=0, fill=1)
        c.rect(icon_x - 1*mm, icon_y - 1.5*mm, 2*mm, 1.5*mm, stroke=0, fill=1)
        c.rect(icon_x - 1.5*mm, icon_y - 2*mm, 3*mm, 0.5*mm, stroke=0, fill=1)"""

content = content.replace(text_find, text_replace)

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
