with open("src/pages/erp/ErpPayments.jsx", "r") as f:
    content = f.read()

# Modify New Payment Modal to pass payment
old_create = """      await erp.createPayment({
        student_id: selectedStudent.id,
        amount: parseFloat(amount),
        mode,
        transaction_ref: transactionRef || undefined,
        next_due_date: nextDueDate || undefined,
        notes: notes || undefined,
        apply_gst: applyGst,
      });
      toast.success(`Fee receipt generated successfully for ${selectedStudent.full_name}`);
      onSuccess();"""
new_create = """      const p = await erp.createPayment({
        student_id: selectedStudent.id,
        amount: parseFloat(amount),
        mode,
        transaction_ref: transactionRef || undefined,
        next_due_date: nextDueDate || undefined,
        notes: notes || undefined,
        apply_gst: applyGst,
      });
      toast.success(`Fee receipt generated successfully for ${selectedStudent.full_name}`);
      onSuccess(p);"""
content = content.replace(old_create, new_create)

# In the render of the NewPaymentModal, change what happens on success:
old_on_success = 'onSuccess={() => { setShowNew(false); fetchPayments(); }}'
new_on_success = 'onSuccess={(p) => { setShowNew(false); fetchPayments(); setViewingReceipt(p); }}'
content = content.replace(old_on_success, new_on_success)

with open("src/pages/erp/ErpPayments.jsx", "w") as f:
    f.write(content)
print("Done patching ErpPayments.jsx")
