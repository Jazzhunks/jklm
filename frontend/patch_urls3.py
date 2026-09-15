import re
import glob

def patch_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # 1. Admit card: `/admit-card/${...}` -> `/admt%2F${...}`
    content = re.sub(
        r'/admit-card/(\$\{[^\}]+\})\?phone=',
        r'/admt%2F\1?phone=',
        content
    )
    
    # 2. Result card: `/result-card/${...}` -> `/res%2F${...}`
    content = re.sub(
        r'/result-card/(\$\{[^\}]+\})\?phone=',
        r'/res%2F\1?phone=',
        content
    )
    
    # 3. Receipts: `/r/${...}` -> `/rec%2F${...}`
    content = re.sub(
        r'/r/(\$\{[^\}]+\})',
        r'/rec%2F\1',
        content
    )

    with open(filepath, "w") as f:
        f.write(content)

for filepath in glob.glob("src/**/*.jsx", recursive=True):
    patch_file(filepath)

print("Done patching URLs to use %2F")
