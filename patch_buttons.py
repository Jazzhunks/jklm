import os
import glob

# Search all JSX files in erp folder
files = glob.glob("frontend/src/pages/erp/**/*.jsx", recursive=True)

import_stmt = 'import { Button } from "@/components/ui/button";\n'

for file_path in files:
    with open(file_path, "r") as f:
        text = f.read()

    # Skip if Button is already imported from ui/button
    if 'import { Button } from "@/components/ui/button"' not in text:
        # Find a good place to inject the import
        if 'import ' in text:
            # Inject after the first import
            idx = text.find('\n', text.find('import ')) + 1
            text = text[:idx] + import_stmt + text[idx:]

    # Replace specific raw buttons we know exist or try a generic replace
    # We will just replace "<button className=" with "<Button className="
    # and "</button>" with "</Button>"
    # This might break if there are native buttons that rely on specific native props,
    # but shadcn Button passes ...props to native button so it's mostly compatible.
    
    if '<button ' in text:
        text = text.replace('<button ', '<Button ')
        text = text.replace('</button>', '</Button>')
        
        with open(file_path, "w") as f:
            f.write(text)

