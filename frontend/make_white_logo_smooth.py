from PIL import Image

img = Image.open("../backend/logo_cropped.png").convert("RGBA")
datas = img.getdata()

newData = []
for item in datas:
    r, g, b, a = item
    # Distance from white (0-255)
    dist = ((255 - r) + (255 - g) + (255 - b)) / 3.0
    
    # We want pure white pixels to have 0 alpha.
    # The true logo colors are around RGB(8, 189, 128) -> dist = 146
    # and RGB(45, 129, 247) -> dist = 114
    # So any dist > 100 is definitely solid logo.
    
    if dist < 5:
        alpha = 0
    else:
        # Scale alpha smoothly from dist=5 to dist=100
        alpha = int((dist - 5) / 95.0 * 255)
        if alpha > 255: alpha = 255
        
    newData.append((255, 255, 255, alpha))

img.putdata(newData)
img.save("../backend/white_logo_transparent.png", "PNG")
print("Successfully generated smooth white_logo_transparent.png")
