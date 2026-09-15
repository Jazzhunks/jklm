def patch_file(filepath, param_name):
    with open(filepath, "r") as f:
        content = f.read()
    
    # We want to change `export default function Component({ type })` to `export default function Component({ type, manualId })`
    # And `const param_name = params['*'] || '';` to `const param_name = manualId || params['*'] || '';`
    if filepath.endswith("PublicReceipt.jsx"):
        content = content.replace("export default function PublicReceipt() {", "export default function PublicReceipt({ manualId }) {")
    else:
        content = content.replace("export default function PublicPdfViewer({ type }) {", "export default function PublicPdfViewer({ type, manualId }) {")
        
    content = content.replace(f"const {param_name} = params['*'] || '';", f"const {param_name} = manualId || params['*'] || '';")
    
    with open(filepath, "w") as f:
        f.write(content)

patch_file("src/pages/PublicReceipt.jsx", "receiptNo")
patch_file("src/pages/PublicPdfViewer.jsx", "applicationNo")
print("Done manualId")
