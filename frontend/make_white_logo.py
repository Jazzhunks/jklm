from PIL import Image

# 1. Convert original logo.svg to PNG using qlmanage
import subprocess
subprocess.run(["qlmanage", "-t", "-s", "600", "-o", ".", "../backend/logo.svg"])
subprocess.run(["mv", "logo.svg.png", "../backend/logo.png"])

# 2. Crop it using sips (600x100 is approx aspect ratio)
subprocess.run(["sips", "-c", "100", "600", "../backend/logo.png", "--out", "../backend/logo_cropped.png"])

# 3. Process with Pillow
img = Image.open("../backend/logo_cropped.png").convert("RGBA")
datas = img.getdata()

newData = []
for item in datas:
    # item is (R, G, B, A)
    # Background is white (255, 255, 255) from qlmanage
    # The logo has green and blue. 
    # Any pixel that is close to white should become transparent.
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        newData.append((255, 255, 255, 0)) # Transparent
    else:
        # Non-white pixel (part of the logo) becomes pure white and solid
        # To handle anti-aliasing, we could check the color intensity, 
        # but just making it solid white is probably fine.
        # Let's keep the alpha channel from the original pixel if it was somewhat blended? 
        # Wait, qlmanage renders on solid white, so alpha is 255 everywhere.
        # We'll just make it solid white.
        newData.append((255, 255, 255, 255))

img.putdata(newData)
img.save("../backend/white_logo_transparent.png", "PNG")
print("Successfully generated white_logo_transparent.png")
