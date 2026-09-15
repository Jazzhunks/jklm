def replace_in_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    # 1. ErpDashboard.jsx
    content = content.replace("`${API_BASE}/erp/receipts/${encodeURIComponent(p.receipt_no)}.pdf`", "`/r/${encodeURIComponent(p.receipt_no)}`")
    
    # 2. ErpPayments.jsx whatsapp template
    content = content.replace("${window.location.origin}/api/erp/receipts/${encodeURIComponent(p.receipt_no)}.pdf", "${window.location.origin}/r/${encodeURIComponent(p.receipt_no)}")
    
    # 3. ReceiptModal.jsx
    content = content.replace("${window.location.origin}/api/erp/receipts/${encodeURIComponent(receiptNo)}.pdf?format=", "${window.location.origin}/r/${encodeURIComponent(receiptNo)}")
    content = content.replace("`${window.location.origin}/api/erp/receipts/${encodeURIComponent(receiptNo)}.pdf`", "`${window.location.origin}/r/${encodeURIComponent(receiptNo)}`")
    
    # We still need the backend download url inside ReceiptModal for direct download button!
    # Wait, the ReceiptModal uses pdfDownloadUrl for `window.print()` and iframe?
    # No, ReceiptModal has:
    # const pdfDownloadUrl = `${API_BASE}/erp/receipts/${encodeURIComponent(receiptNo)}.pdf?format=${...}`
    # We can leave pdfDownloadUrl pointing to API_BASE so the iframe in the modal works.
    # But for the WhatsApp share and Copy Link, we want to share the public frontend URL `/r/receiptNo`
    
    with open(filepath, "w") as f:
        f.write(content)

replace_in_file("src/pages/erp/ErpDashboard.jsx")
replace_in_file("src/pages/erp/ErpPayments.jsx")
replace_in_file("src/pages/erp/ErpStudentDetail.jsx")
replace_in_file("src/pages/erp/modals/ReceiptModal.jsx")
print("Done URLs 2")
