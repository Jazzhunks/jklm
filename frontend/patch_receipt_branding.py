with open("src/pages/erp/modals/ReceiptModal.jsx", "r") as f:
    content = f.read()

content = content.replace("Northend Educational World", "Unacademy")
content = content.replace("NORTHEND EDUCATIONAL WORLD", "UNACADEMY")
content = content.replace("Northend", "Unacademy")
content = content.replace("northendedu.com", "unacademy.com")

with open("src/pages/erp/modals/ReceiptModal.jsx", "w") as f:
    f.write(content)
print("Done patching ReceiptModal branding")
