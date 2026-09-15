import re
import glob

def patch_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Regex to find: `${API_BASE}/scholarship-applications/${VARIABLE}/admit-card?phone=${VARIABLE2}`
    # We want to replace it with: `/admit-card/${VARIABLE}?phone=${VARIABLE2}`
    
    # 1. Admit card
    content = re.sub(
        r'\$\{API_BASE\}/scholarship-applications/(\$\{[^\}]+\})/admit-card\?phone=(\$\{[^\}]+\})',
        r'/admit-card/\1?phone=\2',
        content
    )
    
    # 2. Result card
    content = re.sub(
        r'\$\{API_BASE\}/scholarship-applications/(\$\{[^\}]+\})/result-card\?phone=(\$\{[^\}]+\})',
        r'/result-card/\1?phone=\2',
        content
    )

    with open(filepath, "w") as f:
        f.write(content)

for filepath in glob.glob("src/**/*.jsx", recursive=True):
    patch_file(filepath)

print("Done patching links")
