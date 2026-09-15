import re

with open("src/pages/erp/ErpPayments.jsx", "r") as f:
    content = f.read()

# 1. Add Edit button next to Delete button in the table row
old_buttons = """                      {isSuper(erpUser) && (
                        <button
                          onClick={() => setDeleteModal(p)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                          title="Purge Payment Transaction"
                          data-testid={`delete-payment-${p.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}"""

new_buttons = """                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPaymentModal(p)}
                            className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition"
                            title="Edit Payment Transaction"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(p)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                            title="Purge Payment Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}"""

content = content.replace(old_buttons, new_buttons)

# 2. Add setEditPaymentModal state
content = content.replace(
    'const [deleteModal, setDeleteModal] = useState(null);',
    'const [deleteModal, setDeleteModal] = useState(null);\n  const [editPaymentModal, setEditPaymentModal] = useState(null);'
)

# 3. Add Edit Modal definition & render
modal_code = """
function PaymentEditModal({ payment, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    amount: payment.amount,
    mode: payment.mode,
    paid_at: (payment.paid_at || "").slice(0, 16),
    transaction_ref: payment.transaction_ref || "",
    notes: payment.notes || "",
    apply_gst: (payment.cgst > 0)
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        mode: form.mode,
        paid_at: form.paid_at + ":00Z",
        transaction_ref: form.transaction_ref,
        notes: form.notes,
        apply_gst: form.apply_gst
      };
      await erp.updatePayment(payment.id, payload);
      toast.success("Payment record updated successfully.");
      queryClient.invalidateQueries();
      onClose();
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to update payment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !busy && onClose()}>
      <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 sticky top-0 rounded-t-2xl z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Edit3 size={16}/>
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Edit Transaction</h2>
              <div className="text-[10px] text-muted-foreground font-mono">{payment.receipt_no}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Amount (incl. GST)</label>
              <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Payment Mode</label>
              <select required value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent">
                <option value="cash">CASH</option>
                <option value="upi">UPI</option>
                <option value="online">ONLINE (PG)</option>
                <option value="cheque">CHEQUE</option>
                <option value="card">CARD / POS</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
              <input required type="datetime-local" value={form.paid_at} onChange={e => setForm({...form, paid_at: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Transaction Ref</label>
              <input type="text" value={form.transaction_ref} onChange={e => setForm({...form, transaction_ref: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground select-none cursor-pointer pt-2">
              <input type="checkbox" checked={form.apply_gst} onChange={e => setForm({...form, apply_gst: e.target.checked})} className="rounded text-accent focus:ring-accent w-4 h-4" />
              Apply 18% GST Compliance
            </label>
          </div>
        </form>
        
        <div className="p-4 border-t border-border bg-background/50 rounded-b-2xl flex gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={busy} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-xs uppercase font-bold text-muted-foreground hover:bg-muted transition">Cancel</button>
          <button type="submit" onClick={onSubmit} disabled={busy} className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-xs uppercase font-bold shadow-lg hover:brightness-110 transition disabled:opacity-50">
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErpPayments() {
"""

content = content.replace("export default function ErpPayments() {", modal_code)

content = content.replace(
    '{deleteModal && (',
    '{editPaymentModal && <PaymentEditModal payment={editPaymentModal} onClose={() => setEditPaymentModal(null)} />}\n      {deleteModal && ('
)

# Fix missing import Edit3 in ErpPayments.jsx if needed
if "Edit3" not in content[:1000]:
    content = content.replace("Trash2,", "Trash2, Edit3,")
    content = content.replace("Trash2 }", "Trash2, Edit3 }")

with open("src/pages/erp/ErpPayments.jsx", "w") as f:
    f.write(content)
