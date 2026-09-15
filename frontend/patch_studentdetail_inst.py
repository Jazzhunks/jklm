with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

# I want to inject installment_no into selectedReceipt right before rendering it, or just pass it as a prop.
# Wait, if I just do:
# <ReceiptModal payment={{...selectedReceipt, installment_no: [...stmt.payments].reverse().findIndex(p => p.id === selectedReceipt.id) + 1}}
old_render = "payment={selectedReceipt}"
new_render = "payment={{...selectedReceipt, installment_no: (stmt?.payments?.slice().reverse().findIndex(p => p.id === selectedReceipt.id) ?? 0) + 1}}"

content = content.replace(old_render, new_render)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done")
