import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, isManagerPlus, fmtINR, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { formatError, API_BASE } from "@/lib/api";
import { 
  Plus, Download, X, Check, Ban, Wallet, Search, Calendar, 
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, TrendingDown,
  Building, Clock, FileSpreadsheet
} from "lucide-react";

const CATEGORIES = ["Salary", "Rent", "Electricity", "Internet", "Marketing", "Maintenance", "Miscellaneous"];
const STATUSES = ["all", "pending", "approved", "rejected"];

export default function ErpExpenses() {
  const { erpUser, selectedBranchId } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Filter states
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(searchParams.get("action") === "new");
  const [busyRows, setBusyRows] = useState(new Set());
  const limit = 25;

  // Sync branch with global context
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

  // Fetch expenses with pagination
  const { data: expensesRes, isLoading } = useQuery({
    queryKey: ['erp-expenses', branchId, search, statusFilter, categoryFilter, fromDate, toDate, page],
    queryFn: async () => {
      const params = { skip: (page - 1) * limit, limit };
      if (search) params.search = search;
      if (branchId) params.branch_id = branchId;
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      return erp.listExpenses(params);
    },
    keepPreviousData: true,
  });

  const rawItems = extractItems(expensesRes);
  const totalCount = extractTotal(expensesRes);
  const totalPages = expensesRes?.pages || Math.max(Math.ceil(totalCount / limit), 1);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQ(val);
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const items = rawItems || [];
    const approvedTotal = items.filter(e => e.status === "approved").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const pendingTotal = items.filter(e => e.status === "pending").reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const pendingCount = items.filter(e => e.status === "pending").length;

    // Category breakdown
    const catMap = {};
    items.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + (Number(e.amount) || 0);
    });
    let topCat = "—";
    let maxVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxVal) { maxVal = val; topCat = cat; }
    });

    return { approvedTotal, pendingTotal, pendingCount, topCat };
  }, [rawItems]);

  const reload = () => queryClient.invalidateQueries(['erp-expenses']);

  // Decision Handler (Maker-Checker)
  const decide = async (id, decision) => {
    if (busyRows.has(id)) return;
    const note = window.prompt(`Optional note for ${decision === "approve" ? "approving" : "rejecting"} this expense:`);
    if (note === null) return; // cancelled

    setBusyRows(prev => new Set(prev).add(id));
    try {
      await erp.decideExpense(id, { decision, note: note || undefined });
      toast.success(`Expense successfully ${decision === "approve" ? "approved" : "rejected"}`);
      reload();
    } catch (err) {
      toast.error(formatError(err) || "Failed to submit expense decision");
    } finally {
      setBusyRows(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 flex flex-col min-h-0 animate-fadeIn" data-testid="erp-expenses-page">
      {/* Header Deck */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Outflow &amp; Disbursals</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight mt-1">Expense Sheets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Maker-Checker settlement pipeline, operational expenditure tracking, and vendor ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`${API_BASE}/erp/exports/expenses.xlsx${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ''}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <button className="px-3.5 py-2 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2 transition" data-testid="export-expenses-btn">
              <Download size={14}/> Export Excel
            </button>
          </a>
          <button 
            onClick={() => setShowCreate(true)} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-primary/90 shadow-md transition" 
            data-testid="create-expense-btn"
          >
            <Plus size={14}/> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Settled Outflow</span>
            <TrendingDown size={14} className="text-rose-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-rose-600 font-mono">
            {fmtINR(metrics.approvedTotal)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Approved &amp; reconciled
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Pending Review</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-amber-500 font-mono">
            {fmtINR(metrics.pendingTotal)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.pendingCount} approvals awaiting decision
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Top Category</span>
            <Wallet size={14} className="text-sky-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground truncate">
            {metrics.topCat}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Highest expense allocation
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Total Records</span>
            <FileSpreadsheet size={14} className="text-primary" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground font-mono">
            {totalCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Logged across center ledger
          </div>
        </div>
      </div>

      {/* Filter Tabs & Parameters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-wrap shrink-0">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border overflow-x-auto custom-scrollbar">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                statusFilter === s
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All Statuses" : s}
            </button>
          ))}
        </div>

        {/* Category, Branch, Search */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-xl px-3 py-1.5 bg-card text-xs focus:outline-none text-foreground"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

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

          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input 
              type="text"
              value={q} 
              onChange={handleSearchChange} 
              placeholder="Search vendor, description..." 
              className="w-full pl-9 pr-3 py-1.5 border border-border bg-card rounded-xl text-xs focus:outline-none focus:border-primary transition text-foreground"
              data-testid="search-expenses-input"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">From</span>
            <input 
              type="date" 
              value={fromDate} 
              onChange={e => { setFromDate(e.target.value); setPage(1); }} 
              className="bg-transparent border-0 p-0 text-xs text-foreground focus:outline-none" 
            />
          </div>

          <div className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">To</span>
            <input 
              type="date" 
              value={toDate} 
              onChange={e => { setToDate(e.target.value); setPage(1); }} 
              className="bg-transparent border-0 p-0 text-xs text-foreground focus:outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="glass-elevated rounded-2xl border border-border w-full overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
          <table className="w-full text-sm table-fixed border-collapse min-w-[920px]">
            <thead className="bg-muted text-muted-foreground sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <tr className="text-left backdrop-blur-md">
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Date</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Category</th>
                <th className="w-[28%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Description</th>
                <th className="w-[15%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Vendor / Party</th>
                <th className="w-[11%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Status</th>
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-muted">Amount</th>
                <th className="w-[8%] px-5 py-3.5 bg-muted text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background/20">
              {rawItems.map(e => (
                <tr key={e.id} className="hover:bg-muted/40 transition-colors group" data-testid={`exp-row-${e.id}`}>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap text-muted-foreground font-mono">{fmtDate(e.expense_date)}</td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-muted/60 rounded-md border border-border text-foreground font-medium text-[11px]">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-foreground truncate" title={e.description}>
                    <div className="truncate font-medium">{e.description}</div>
                    {e.decision_note && (
                      <div className="text-[10px] text-muted-foreground italic truncate">Note: {e.decision_note}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground truncate" title={e.vendor}>{e.vendor || "—"}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusBadge s={e.status} />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-right font-bold text-rose-600 whitespace-nowrap text-sm">{fmtINR(e.amount)}</td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {isManagerPlus(erpUser) && e.status === "pending" && (
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          disabled={busyRows.has(e.id)}
                          onClick={() => decide(e.id, "approve")} 
                          title="Approve & Settle" 
                          className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 rounded-lg transition disabled:opacity-40" 
                          data-testid={`approve-${e.id}`}
                        >
                          <Check size={14}/>
                        </button>
                        <button 
                          disabled={busyRows.has(e.id)}
                          onClick={() => decide(e.id, "reject")} 
                          title="Reject Outflow" 
                          className="p-1.5 text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition disabled:opacity-40" 
                          data-testid={`reject-${e.id}`}
                        >
                          <Ban size={14}/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rawItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-muted-foreground italic text-sm">
                    {isLoading ? "Loading expense sheets..." : "No expense records found matching current parameters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div>
            Showing <span className="font-semibold text-foreground">{rawItems.length}</span> of <span className="font-semibold text-foreground">{totalCount}</span> total items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition"
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
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Expense Modal */}
      {showCreate && (
        <CreateExpenseModal 
          onClose={() => { setShowCreate(false); setSearchParams({}); }} 
          onSuccess={() => { setShowCreate(false); setSearchParams({}); reload(); }} 
          branchId={branchId || erpUser.branch_id}
          branches={branches}
          isSuper={isSuper(erpUser)}
        />
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ s }) {
  const norm = s?.toLowerCase() || "";
  let config = "bg-muted/50 text-muted-foreground border-border";
  let label = s || "Pending";

  if (norm === "approved") {
    config = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    label = "Settled";
  } else if (norm === "rejected") {
    config = "bg-rose-500/10 text-rose-600 border-rose-500/20";
    label = "Rejected";
  } else if (norm === "pending") {
    config = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    label = "Pending";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config}`}>
      {norm === "approved" && <CheckCircle2 size={10} />}
      {norm === "pending" && <Clock size={10} />}
      {norm === "rejected" && <AlertCircle size={10} />}
      {label}
    </span>
  );
}

// Create Expense Modal Dialog
function CreateExpenseModal({ onClose, onSuccess, branchId, branches, isSuper }) {
  const [targetBranchId, setTargetBranchId] = useState(branchId || (branches[0]?.id || ""));
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [billUrl, setBillUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide an expense description");
      return;
    }

    setSubmitting(true);
    try {
      await erp.createExpense({
        branch_id: targetBranchId,
        category,
        amount: parseFloat(amount),
        description: description.trim(),
        vendor: vendor.trim() || undefined,
        expense_date: expenseDate || undefined,
        bill_url: billUrl.trim() || undefined,
      });
      toast.success("Expense recorded successfully");
      onSuccess();
    } catch (err) {
      toast.error(formatError(err) || "Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Record Center Outflow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Submit branch expenditure for approval and ledger entry</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {isSuper && branches.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Branch Location *
              </label>
              <select
                value={targetBranchId}
                onChange={e => setTargetBranchId(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-semibold text-foreground focus:outline-none"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-semibold text-foreground focus:outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
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
                placeholder="₹ 5,000"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-mono font-bold text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Description / Reason *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of goods/services procured..."
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Vendor / Recipient
              </label>
              <input
                type="text"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="e.g., J&K Power Dept"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Receipt / Invoice Link (Optional)
            </label>
            <input
              type="url"
              value={billUrl}
              onChange={e => setBillUrl(e.target.value)}
              placeholder="https://storage... or invoice URL"
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

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
              {submitting ? "Submitting..." : "Submit Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}