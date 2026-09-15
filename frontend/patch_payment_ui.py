with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

import re

# 1. Update the select options
old_select = """              <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cheque">Cheque</option>
              </select>"""
new_select = """              <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cheque">Cheque</option>
                <option value="pine_labs_edc">Pine Labs EDC (Cloud)</option>
              </select>"""
content = content.replace(old_select, new_select)

# 2. Update submit logic to handle Pine Labs flow
old_submit = """      await erp.createPayment({
        student_id: studentId,
        amount: entryAmount,
        mode: form.mode,
        apply_gst: form.apply_gst,
        next_due_date: form.next_due_date || null,
        notes: form.notes || null,
        transaction_ref: form.transaction_ref || undefined,
      });
      onCreated();
    } catch (err) {"""

new_submit = """      const payment = await erp.createPayment({
        student_id: studentId,
        amount: entryAmount,
        mode: form.mode,
        apply_gst: form.apply_gst,
        next_due_date: form.next_due_date || null,
        notes: form.notes || null,
        transaction_ref: form.transaction_ref || undefined,
      });

      if (form.mode === "pine_labs_edc") {
        toast.loading("Sending transaction to Pine Labs EDC...", { id: "pinelabs" });
        await api.post(`/erp/payments/${encodeURIComponent(payment.id)}/pinelabs/push`);
        toast.loading("Waiting for customer to pay on terminal...", { id: "pinelabs" });
        
        // Poll for status
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await api.get(`/erp/payments/${encodeURIComponent(payment.id)}/pinelabs/status`);
            if (statusRes.data.status === "APPROVED") {
              clearInterval(poll);
              toast.success("Payment successful via Pine Labs!", { id: "pinelabs" });
              onCreated();
            } else if (statusRes.data.status === "FAILED") {
              clearInterval(poll);
              toast.error("Payment failed on terminal", { id: "pinelabs" });
              onCreated(); // Still reload to show failed status or we can handle it
            }
          } catch (e) {
            // Ignore minor network errors during polling
          }
          if (attempts > 30) {
            clearInterval(poll);
            toast.error("Pine Labs polling timeout. Please check terminal.", { id: "pinelabs" });
            onCreated();
          }
        }, 3000);
        return; // Don't call onCreated immediately
      }

      onCreated();
    } catch (err) {"""
content = content.replace(old_submit, new_submit)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching ErpStudentDetail UI")
