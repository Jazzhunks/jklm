with open("../backend/pdf_client.py", "r") as f:
    content = f.read()

content = content.replace("c.setFillColorRGB(0.24, 0.44, 0.70)", "c.setFillColorRGB(0.30, 0.49, 0.74)")

# Improve the silhouette on the back
silhouette_old = "c.circle(0, back_h/2 - 22*mm, 4*mm, stroke=0, fill=1)"
silhouette_new = """        c.circle(0, back_h/2 - 19.5*mm, 2.5*mm, stroke=0, fill=1)
        c.roundRect(-4.5*mm, back_h/2 - 26*mm, 9*mm, 4*mm, 2*mm, stroke=0, fill=1)"""
content = content.replace(silhouette_old, silhouette_new)

# Improve pill shape and unacademy logo alignment
# unacademy green is exactly 0.04, 0.76, 0.43 (from my previous patch).
# Let's adjust the text size and trophy icon if possible.
# Actually I'll just keep it simple.

with open("../backend/pdf_client.py", "w") as f:
    f.write(content)
