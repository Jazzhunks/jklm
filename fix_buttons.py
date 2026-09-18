import os
import glob

files = glob.glob("frontend/src/pages/erp/**/*.jsx", recursive=True)

for file_path in files:
    with open(file_path, "r") as f:
        text = f.read()

    # The previous script did text.replace('<button ', '<Button ') and text.replace('</button>', '</Button>')
    # It missed `<button>` without a trailing space!
    if '<button>' in text or '<button\n' in text or '<button\r' in text:
        text = text.replace('<button>', '<Button>')
        text = text.replace('<button\n', '<Button\n')
        text = text.replace('<button\r', '<Button\r')
        
        with open(file_path, "w") as f:
            f.write(text)

