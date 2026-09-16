with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

# 1. Modify RecordPaymentModal to pass the result
old_create = """      await erp.createPayment({
        student_id: studentId,
        amount: entryAmount,
        mode: form.mode,
        apply_gst: form.apply_gst,
        next_due_date: form.next_due_date || null,
        notes: form.notes || null,
        transaction_ref: form.transaction_ref || undefined,
      });
      onCreated();"""
new_create = """      const p = await erp.createPayment({
        student_id: studentId,
        amount: entryAmount,
        mode: form.mode,
        apply_gst: form.apply_gst,
        next_due_date: form.next_due_date || null,
        notes: form.notes || null,
        transaction_ref: form.transaction_ref || undefined,
      });
      onCreated(p);"""
content = content.replace(old_create, new_create)

# 2. Modify ErpStudentDetail to open the receipt
old_on_created = 'onCreated={() => { setShowPay(false); reload(); toast.success("Payment recorded successfully."); }}'
new_on_created = 'onCreated={(newPayment) => { setShowPay(false); reload(); toast.success("Payment recorded successfully."); setViewingReceipt(newPayment); }}'
content = content.replace(old_on_created, new_on_created)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching ErpStudentDetail.jsx")
