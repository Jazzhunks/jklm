with open("src/pages/erp/modals/GstSettlementModal.jsx", "r") as f:
    content = f.read()

content = content.replace("gstData?.total_gstable", "gstData?.total_taxable")

with open("src/pages/erp/modals/GstSettlementModal.jsx", "w") as f:
    f.write(content)
print("Done")
