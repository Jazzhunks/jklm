import os
import glob

def replace_in_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    # Simple regex or string replacements for the exact patterns
    
    # 1. ErpDashboard.jsx
    content = content.replace("`${API_BASE}/erp/payments/${p.id}/receipt`", "`${API_BASE}/erp/receipts/${encodeURIComponent(p.receipt_no)}.pdf`")
    
    # 2. ErpPayments.jsx whatsapp template
    content = content.replace("${window.location.origin}/api/erp/payments/${p.id}/receipt", "${window.location.origin}/api/erp/receipts/${encodeURIComponent(p.receipt_no)}.pdf")
    
    # 3. ReceiptModal.jsx
    # Note: ReceiptModal uses `payment.id` and `receiptNo`
    content = content.replace("`${API_BASE}/erp/payments/${payment.id}/receipt?format=${", "`${API_BASE}/erp/receipts/${encodeURIComponent(receiptNo)}.pdf?format=${")
    content = content.replace("${window.location.origin}/api/erp/payments/${payment.id}/receipt?format=", "${window.location.origin}/api/erp/receipts/${encodeURIComponent(receiptNo)}.pdf?format=")
    content = content.replace("`${window.location.origin}/api/erp/payments/${payment.id}/receipt`", "`${window.location.origin}/api/erp/receipts/${encodeURIComponent(receiptNo)}.pdf`")
    
    with open(filepath, "w") as f:
        f.write(content)

replace_in_file("src/pages/erp/ErpDashboard.jsx")
replace_in_file("src/pages/erp/ErpPayments.jsx")
replace_in_file("src/pages/erp/ErpStudentDetail.jsx")
replace_in_file("src/pages/erp/modals/ReceiptModal.jsx")
print("Done URLs")
