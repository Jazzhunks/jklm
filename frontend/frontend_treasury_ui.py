import re

with open("src/pages/erp/ErpPayments.jsx", "r") as f:
    content = f.read()

# Add new imports
if "Wallet," not in content:
    content = content.replace("Banknote, \n", "Banknote, Wallet,\n")

if "activeTab" not in content:
    content = content.replace('const [showGstModal, setShowGstModal] = useState(false);', 'const [showGstModal, setShowGstModal] = useState(false);\n  const [activeTab, setActiveTab] = useState("ledger");')

# Add Treasury transfer modal component
treasury_modal = """
function TreasuryTransferModal({ branchId, onClose, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    direction: "cash_to_bank",
    amount: "",
    transfer_date: new Date().toISOString().slice(0, 16),
    deposited_by_name: "",
    bank_txn_id: "",
    notes: ""
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await erp.createTreasuryTransfer({
        ...form,
        amount: parseFloat(form.amount),
        transfer_date: form.transfer_date + ":00Z",
        branch_id: branchId || "all"
      });
      toast.success("Treasury transfer recorded successfully!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to record transfer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !busy && onClose()}>
      <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 sticky top-0 rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Landmark size={16}/>
            </div>
            <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Treasury Transfer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition text-muted-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Direction</label>
            <select value={form.direction} onChange={e => setForm({...form, direction: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none">
              <option value="cash_to_bank">Cash Deposit to Bank</option>
              <option value="bank_to_cash">Bank Withdrawal to Cash</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Amount</label>
            <input required type="number" step="0.01" min="1" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Transfer Date</label>
            <input required type="datetime-local" value={form.transfer_date} onChange={e => setForm({...form, transfer_date: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Actioned By (Name)</label>
            <input required type="text" value={form.deposited_by_name} onChange={e => setForm({...form, deposited_by_name: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Bank Transaction ID / Ref</label>
            <input required type="text" value={form.bank_txn_id} onChange={e => setForm({...form, bank_txn_id: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none" placeholder="Bank ref or cheque no" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Notes (Optional)</label>
            <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none" />
          </div>
          <button type="submit" disabled={busy} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50">
            {busy ? "Processing..." : "Commit Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TreasuryView({ branchId }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  
  const { data: summary, isLoading: sLoading } = useQuery({
    queryKey: ['erp-treasury-summary', branchId],
    queryFn: () => erp.getTreasurySummary({ branch_id: branchId })
  });
  
  const { data: transfers, isLoading: tLoading } = useQuery({
    queryKey: ['erp-treasury-transfers', branchId],
    queryFn: () => erp.listTreasuryTransfers({ branch_id: branchId })
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {showModal && <TreasuryTransferModal branchId={branchId} onClose={() => setShowModal(false)} onUpdated={() => {
        queryClient.invalidateQueries(['erp-treasury-summary']);
        queryClient.invalidateQueries(['erp-treasury-transfers']);
      }} />}
      
      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-elevated p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Banknote size={16}/> Cash In Hand</div>
          </div>
          <div className="font-display text-4xl font-bold text-emerald-500">{fmtINR(summary?.net_cash_balance || 0)}</div>
          <div className="mt-4 text-xs font-mono text-muted-foreground">Total In: {fmtINR(summary?.cash_in || 0)} | Total Out: {fmtINR(summary?.cash_out || 0)}</div>
        </div>
        <div className="glass-elevated p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Landmark size={16}/> Bank Balance</div>
          </div>
          <div className="font-display text-4xl font-bold text-sky-500">{fmtINR(summary?.net_bank_balance || 0)}</div>
          <div className="mt-4 text-xs font-mono text-muted-foreground">Total In: {fmtINR(summary?.bank_in || 0)} | Total Out: {fmtINR(summary?.bank_out || 0)}</div>
        </div>
      </div>
      
      {/* Transfer Action */}
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-xs uppercase tracking-wider font-bold shadow-md hover:brightness-110 flex items-center gap-2">
          <Plus size={14}/> Record Treasury Transfer
        </button>
      </div>
      
      {/* Transfer History Table */}
      <div className="glass-elevated rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4">Receipt</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Direction</th>
                <th className="px-5 py-4 text-right">Amount</th>
                <th className="px-5 py-4">Actioned By</th>
                <th className="px-5 py-4">Bank Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(transfers || []).map(t => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4 font-mono text-xs">{t.receipt_no}</td>
                  <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{fmtDate(t.transfer_date)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${t.direction === "cash_to_bank" ? "bg-sky-500/10 text-sky-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {t.direction.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold">{fmtINR(t.amount)}</td>
                  <td className="px-5 py-4">{t.deposited_by_name}</td>
                  <td className="px-5 py-4 font-mono text-xs">{t.bank_txn_id}</td>
                </tr>
              ))}
              {transfers?.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-muted-foreground text-sm">No treasury transfers recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"""
content = content.replace("export default function ErpPayments() {", treasury_modal + "\nexport default function ErpPayments() {")

# Add Tabs UI
tabs_ui = """
      {/* Tabs */}
      <div className="flex border-b border-border mb-2">
        <button onClick={() => setActiveTab("ledger")} className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "ledger" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Student Payments</button>
        <button onClick={() => setActiveTab("treasury")} className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "treasury" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Treasury & Banking</button>
      </div>
"""
content = content.replace("{/* KPI Ribbon */}", tabs_ui + "\n      {activeTab === 'ledger' && (\n      <>\n      {/* KPI Ribbon */}")

# Close the ledger block at the bottom
content = content.replace("</div>\n  );\n}", "      </>\n      )}\n      {activeTab === 'treasury' && <TreasuryView branchId={branchId} />}\n    </div>\n  );\n}")

with open("src/pages/erp/ErpPayments.jsx", "w") as f:
    f.write(content)
