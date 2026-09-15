with open("src/pages/erp/modals/GstSettlementModal.jsx", "r") as f:
    content = f.read()

content = content.replace("gstData?.receipts", "gstData?.items")
content = content.replace("gstData?.gross_revenue", "gstData?.total_gross")
content = content.replace("gstData?.taxable_value", "gstData?.total_taxable")
content = content.replace("gstData?.cgst_total", "gstData?.total_cgst")
content = content.replace("gstData?.sgst_total", "gstData?.total_sgst")
content = content.replace("gstData?.total_tax", "gstData?.total_gst")

with open("src/pages/erp/modals/GstSettlementModal.jsx", "w") as f:
    f.write(content)
