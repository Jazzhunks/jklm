import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, fmtINR, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { API_BASE, formatError } from "@/lib/api";
import { 
  Download, Search, Calendar, FileText, CreditCard, Banknote, 
  Plus, MessageSquare, CheckCircle, ChevronLeft, ChevronRight, 
  ArrowUpRight, DollarSign, X, Receipt as ReceiptIcon, ShieldCheck, Printer
} from "lucide-react";
import ReceiptModal from "./modals/ReceiptModal";


const MODES = ["all", "cash", "upi", "online", "cheque", "card"];

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
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const limit = 25;

  // Keep branch in sync with global header switcher if super admin
  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setBranchId(selectedBranchId);
      setPage(1);
    }
  }, [selectedBranchId]);

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
    const txt = `Dear Student/Parent,\n\nOfficial fee payment of ${fmtINR(p.amount)} has been successfully recorded at Northend Educational World.\n\nReceipt No: ${p.receipt_no}\nDate: ${fmtDate(p.paid_at)}\nStudent ID: ${p.student_no}\nPayment Mode: ${p.mode?.toUpperCase()}\n\nYou can download your verified digital tax receipt here:\n${window.location.origin}/api/erp/payments/${p.id}/receipt\n\nWarm regards,\nNorthend Accounts Team`;
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
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Receipt ID</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Date</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Student ID</th>
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Mode</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Collected By</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-muted">Net Amount</th>
                <th className="w-[12%] px-5 py-3.5 bg-muted text-right">Actions</th>
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
                  <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-600 whitespace-nowrap text-sm">{fmtINR(p.amount)}</td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => sendWhatsAppReceipt(p)}
                        title="Send Receipt via WhatsApp"
                        className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button 
                        onClick={() => setSelectedReceipt(p)} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-lg transition" 
                        data-testid={`receipt-${p.id}`}
                        title="View Receipt (A4 or Thermal POS)"
                      >
                        <Printer size={12} /> Receipt
                      </button>
                      <a 
                        href={`${API_BASE}/erp/payments/${p.id}/receipt`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition" 
                        title="Direct A4 PDF Download"
                        data-testid={`dl-${p.id}`}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </td>

                </tr>
              ))}
              {rawItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-muted-foreground italic text-sm">
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
          onSuccess={() => { setShowCreate(false); setSearchParams({}); reload(); }} 
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
      await erp.createPayment({
        student_id: selectedStudent.id,
        amount: parseFloat(amount),
        mode,
        transaction_ref: transactionRef || undefined,
        next_due_date: nextDueDate || undefined,
        notes: notes || undefined,
        apply_gst: applyGst,
      });
      toast.success(`Fee receipt generated successfully for ${selectedStudent.full_name}`);
      onSuccess();
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