def replace_params(filepath, param_name):
    with open(filepath, "r") as f:
        content = f.read()
    
    # We want to replace `const { param_name } = useParams();`
    # with `const params = useParams(); const param_name = params["*"];`
    content = content.replace(f"const {{ {param_name} }} = useParams();", f"const params = useParams();\n  const {param_name} = params['*'] || '';")
    
    with open(filepath, "w") as f:
        f.write(content)

replace_params("src/pages/PublicReceipt.jsx", "receiptNo")
replace_params("src/pages/PublicPdfViewer.jsx", "applicationNo")
print("Done viewers")
