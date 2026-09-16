import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, fmtINR, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { API_BASE, formatError } from "@/lib/api";
import { 
  Download, Search, Calendar, FileText, CreditCard, Banknote, Wallet,
  Plus, MessageSquare, CheckCircle, ChevronLeft, ChevronRight, 
  ArrowUpRight, DollarSign, X, Receipt as ReceiptIcon, ShieldCheck, Printer,
  Trash2, Edit3, AlertTriangle, Landmark
} from "lucide-react";
import ReceiptModal from "./modals/ReceiptModal";
import GstSettlementModal from "./modals/GstSettlementModal";


const MODES = ["all", "cash", "upi", "online", "cheque", "card"];


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

export default function ErpPayments() {


  const { erpUser, selectedBranchId } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Local state
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMode, setSelectedMode] = useState("all");
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(searchParams.get("action") === "new");
  const [showGstModal, setShowGstModal] = useState(false);
  const [activeTab, setActiveTab] = useState("ledger");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editPaymentModal, setEditPaymentModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 25;

  // Keep branch in sync with global header switcher if super admin
  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setBranchId(selectedBranchId);
      setPage(1);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    setShowCreate(searchParams.get("action") === "new");
  }, [searchParams]);

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['erp-branches'],
    queryFn: () => erp.listBranches(),
  });

  // Fetch payments with server-side pagination & filters
  const { data: paymentsRes, isLoading, isFetching } = useQuery({
    queryKey: ['erp-payments', branchId, search, selectedMode, fromDate, toDate, page],
    queryFn: async () => {
      const params = { skip: (page - 1) * limit, limit };
      if (search) params.search = search;
      if (branchId) params.branch_id = branchId;
      if (selectedMode !== "all") params.mode = selectedMode;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      return erp.listPayments(params);
    },
    keepPreviousData: true,
  });

  const rawItems = extractItems(paymentsRes);
  const totalCount = extractTotal(paymentsRes);
  const totalPages = paymentsRes?.pages || Math.max(Math.ceil(totalCount / limit), 1);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQ(val);
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  // Metrics computation from visible / current result dataset
  const metrics = useMemo(() => {
    const items = rawItems || [];
    const totalRealized = items.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const onlineTotal = items.filter(p => ["upi", "online", "card"].includes(p.mode?.toLowerCase())).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const cashTotal = items.filter(p => p.mode?.toLowerCase() === "cash").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const gstTotal = items.reduce((acc, p) => acc + (Number(p.cgst || 0) + Number(p.sgst || 0)), 0);
    const avgTicket = items.length > 0 ? totalRealized / items.length : 0;
    return { totalRealized, onlineTotal, cashTotal, gstTotal, avgTicket };
  }, [rawItems]);

  const reload = () => queryClient.invalidateQueries(['erp-payments']);

  // WhatsApp receipt trigger
  const sendWhatsAppReceipt = (p) => {
    const txt = `Dear Student/Parent,\n\nOfficial fee payment of ${fmtINR(p.amount)} has been successfully recorded at Northend Educational World.\n\nReceipt No: ${p.receipt_no}\nDate: ${fmtDate(p.paid_at)}\nStudent ID: ${p.student_no}\nPayment Mode: ${p.mode?.toUpperCase()}\n\nYou can download your verified digital tax receipt here:\n${window.location.origin}/rec%2F${encodeURIComponent(p.receipt_no)}\n\nWarm regards,\nNorthend Accounts Team`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  };

  return (
    <div className="space-y-6 flex flex-col min-h-0 animate-fadeIn" data-testid="erp-payments-page">
      {/* Header Deck */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Cashbook &amp; Financial Ledger</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight mt-1">Fee Collections</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Verified academic receipts, digital reconciliations, and tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGstModal(true)} 
            className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition shadow-sm" 
            data-testid="monthly-gst-modal-btn"
          >
            <Landmark size={14}/> Monthly GST Portal
          </button>
          <a 
            href={`${API_BASE}/erp/exports/payments.xlsx${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ''}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <button className="px-3.5 py-2 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2 transition" data-testid="export-payments-btn">
              <Download size={14}/> Export Excel
            </button>
          </a>
          {erpUser.role !== "counsellor" && (
            <button 
              onClick={() => setShowCreate(true)} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-primary/90 shadow-md transition" 
              data-testid="create-payment-btn"
            >
              <Plus size={14}/> Record Payment
            </button>
          )}
        </div>
      </div>

      
      {/* Tabs */}
      <div className="flex border-b border-border mb-2 mt-4">
        <button onClick={() => setActiveTab("ledger")} className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "ledger" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Student Payments</button>
        <button onClick={() => setActiveTab("treasury")} className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "treasury" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Treasury & Banking</button>
      </div>

      {activeTab === 'ledger' && (
      <div className="space-y-6 flex flex-col min-h-0">

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Collections (View)</span>
            <DollarSign size={14} className="text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground">
            {fmtINR(metrics.totalRealized)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
            {rawItems.length} transactions processed
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Online vs Cash</span>
            <CreditCard size={14} className="text-sky-500" />
          </div>
          <div className="font-display text-lg font-semibold mt-2 text-foreground truncate">
            {fmtINR(metrics.onlineTotal)} <span className="text-xs text-muted-foreground font-normal">/ {fmtINR(metrics.cashTotal)}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Digital ratio: {metrics.totalRealized > 0 ? Math.round((metrics.onlineTotal / metrics.totalRealized) * 100) : 0}%
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>GST Realized</span>
            <ShieldCheck size={14} className="text-amber-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground">
            {fmtINR(metrics.gstTotal)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
            CGST + SGST (18%)
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Average Ticket</span>
            <ArrowUpRight size={14} className="text-primary" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground">
            {fmtINR(metrics.avgTicket)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono">
            Per receipt average
          </div>
        </div>
      </div>

      {/* Mode Filters & Parameter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-wrap shrink-0">
        {/* Payment Mode Pills */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border overflow-x-auto custom-scrollbar">
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => { setSelectedMode(m); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                selectedMode === m
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search, Branch, Date Pickers */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input 
              type="text"
              value={q} 
              onChange={handleSearchChange} 
              placeholder="Search receipt, student ID, collector..." 
              className="w-full pl-9 pr-3 py-1.5 border border-border bg-card rounded-xl text-xs focus:outline-none focus:border-primary transition text-foreground"
              data-testid="search-payments-input"
            />
          </div>

          {isSuper(erpUser) && (
            <select 
              value={branchId} 
              onChange={e => { setBranchId(e.target.value); setPage(1); }} 
              className="border border-border rounded-xl px-3 py-1.5 bg-card text-xs focus:outline-none text-foreground" 
              data-testid="filter-branch"
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}

          <div className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">From</span>
            <input 
              type="date" 
              value={fromDate} 
              onChange={e => { setFromDate(e.target.value); setPage(1); }} 
              className="bg-transparent border-0 p-0 text-xs text-foreground focus:outline-none" 
              data-testid="filter-from"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">To</span>
            <input 
              type="date" 
              value={toDate} 
              onChange={e => { setToDate(e.target.value); setPage(1); }} 
              className="bg-transparent border-0 p-0 text-xs text-foreground focus:outline-none" 
              data-testid="filter-to"
            />
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="glass-elevated rounded-2xl border border-border w-full overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
          <table className="w-full text-sm table-fixed border-collapse min-w-[880px]">
            <thead className="bg-muted text-muted-foreground sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <tr className="text-left backdrop-blur-md">
                <th className="w-[20%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Receipt ID</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Date</th>
                <th className="w-[20%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Student ID</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Mode</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Collected By</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-muted pr-10">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background/20">
              {rawItems.map(p => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors group" data-testid={`pay-row-${p.id}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground tracking-wide font-semibold">{p.receipt_no}</td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap text-muted-foreground">{fmtDate(p.paid_at, true)}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground font-medium">{p.student_no}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <ModeBadge mode={p.mode} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground truncate" title={p.collected_by_name}>{p.collected_by_name || "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-600 whitespace-nowrap text-sm pr-10">{fmtINR(p.amount)}</td>

                </tr>
              ))}
              {rawItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-muted-foreground italic text-sm">
                    {isLoading ? "Loading collections ledger..." : "No financial transactions found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div>
            Showing <span className="font-semibold text-foreground">{rawItems.length}</span> of <span className="font-semibold text-foreground">{totalCount}</span> total receipts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition"
              data-testid="prev-page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition"
              data-testid="next-page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showCreate && (
        <CreatePaymentModal 
          onClose={() => { setShowCreate(false); setSearchParams({}); }} 
          onSuccess={(p) => { setShowCreate(false); setSearchParams({}); reload(); setSelectedReceipt(p); }} 
          defaultBranchId={branchId || erpUser.branch_id}
          branches={branches}
        />
      )}

      {/* Multi-Format Receipt & POS Printing Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Monthly GST Compliance & Settlement Modal */}
      {showGstModal && (
        <GstSettlementModal
          onClose={() => setShowGstModal(false)}
          defaultBranchId={branchId || erpUser?.branch_id || ""}
          branches={branches}
        />
      )}

      {editPaymentModal && <PaymentEditModal payment={editPaymentModal} onClose={() => setEditPaymentModal(null)} />}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="font-display font-medium text-lg text-foreground">Purge Transaction</h3>
                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete payment receipt <strong className="text-foreground font-mono">{deleteModal.receipt_no}</strong> for amount <strong className="text-emerald-500 font-mono">{fmtINR(deleteModal.amount)}</strong>?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await erp.deletePayment(deleteModal.id);
                    toast.success(`Payment ${deleteModal.receipt_no} purged successfully.`);
                    queryClient.invalidateQueries();
                    setDeleteModal(null);
                  } catch (err) {
                    toast.error(formatError(err.response?.data?.detail) || "Failed to delete payment transaction");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-rose-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13}/> {deleting ? "Purging..." : "Confirm Purge"}
              </button>
              <button
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      )}
      {activeTab === 'treasury' && <TreasuryView branchId={branchId} />}
    </div>
  );
}

// Payment Mode Badge
function ModeBadge({ mode }) {
  const norm = mode?.toLowerCase() || "";
  let config = "bg-muted/50 text-muted-foreground border-border";
  
  if (norm === "cash") {
    config = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  } else if (norm === "upi" || norm === "online") {
    config = "bg-sky-500/10 text-sky-400 border-sky-500/20";
  } else if (norm === "cheque" || norm === "card") {
    config = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config}`}>
      {norm === "cash" && <Banknote size={10} />}
      {["card", "online", "upi"].includes(norm) && <CreditCard size={10} />}
      {mode}
    </span>
  );
}

// Create Payment Modal Dialog
function CreatePaymentModal({ onClose, onSuccess, defaultBranchId, branches }) {
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [matchingStudents, setMatchingStudents] = useState([]);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("upi");
  const [transactionRef, setTransactionRef] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [applyGst, setApplyGst] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Student search
  useEffect(() => {
    if (!studentQuery.trim() || studentQuery.length < 2) {
      setMatchingStudents([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await erp.listStudents({ q: studentQuery.trim(), limit: 5 });
        setMatchingStudents(extractItems(res));
      } catch {
        setMatchingStudents([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [studentQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please search and select a student record");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setSubmitting(true);
    try {
      const p = await erp.createPayment({
        student_id: selectedStudent.id,
        amount: parseFloat(amount),
        mode,
        transaction_ref: transactionRef || undefined,
        next_due_date: nextDueDate || undefined,
        notes: notes || undefined,
        apply_gst: applyGst,
      });
      toast.success(`Fee receipt generated successfully for ${selectedStudent.full_name}`);
      onSuccess(p);
    } catch (err) {
      toast.error(formatError(err) || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Record Fee Collection</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Generate official tax receipt and credit student account</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Student Search / Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Select Student *
            </label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-primary/30">
                <div>
                  <div className="font-bold text-xs text-foreground">{selectedStudent.full_name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{selectedStudent.student_no} • {selectedStudent.contact_phone}</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setSelectedStudent(null); setStudentQuery(""); }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={studentQuery}
                  onChange={e => setStudentQuery(e.target.value)}
                  placeholder="Type student name, roll number, or phone..."
                  className="w-full pl-9 pr-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                />
                {matchingStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-30 divide-y divide-border overflow-hidden">
                    {matchingStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => { setSelectedStudent(s); setMatchingStudents([]); }}
                        className="p-2.5 hover:bg-muted/50 cursor-pointer text-xs"
                      >
                        <div className="font-semibold text-foreground">{s.full_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{s.student_no} • {s.contact_phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Amount (INR) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="₹ 15,000"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Payment Mode *
              </label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="upi">UPI / QR</option>
                <option value="cash">Cash In Hand</option>
                <option value="card">Debit / Credit Card</option>
                <option value="online">Net Banking</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Transaction Reference & Next Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Ref / Cheque / UTR No
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="Optional UTR or Cheque #"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={e => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* GST Toggle */}
          <label className="flex items-center gap-2 cursor-pointer p-3 bg-muted/20 rounded-xl border border-border">
            <input
              type="checkbox"
              checked={applyGst}
              onChange={e => setApplyGst(e.target.checked)}
              className="rounded text-primary focus:ring-0"
            />
            <div>
              <div className="text-xs font-semibold text-foreground">Apply GST Tax Invoice (18% split)</div>
              <div className="text-[10px] text-muted-foreground">Calculates CGST (9%) + SGST (9%) on tax receipt</div>
            </div>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Internal Ledger Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., 2nd Installment payment clearance"
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 shadow-md transition disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Generate Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}