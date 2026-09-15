with open("src/pages/erp/ErpLayout.jsx", "r") as f:
    content = f.read()

content = content.replace(
    'if (erpUser?.role === "attendance" && location.pathname === "/erp") {',
    'if (erpUser?.role === "attendance" && (location.pathname === "/erp" || location.pathname === "/erp/")) {'
)

with open("src/pages/erp/ErpLayout.jsx", "w") as f:
    f.write(content)
print("Done patching layout again")
