import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, isManagerPlus, fmtINR, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { formatError, API_BASE } from "@/lib/api";
import { Plus, Download, X, Check, Ban, Wallet, Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, TrendingDown, Clock, FileSpreadsheet, Trash2, AlertTriangle } from "lucide-react";

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
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 25;

  // Sync branch with global context
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
    <div className="space-y-6 bg-slate-50 dark:bg-black p-6 flex flex-col min-h-0 animate-fadeIn" data-testid="erp-expenses-page">
      {/* Header Deck */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Outflow &amp; Disbursals</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Expense Sheets</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">
            Maker-Checker settlement pipeline, operational expenditure tracking, and vendor ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`${API_BASE}/erp/exports/expenses.xlsx${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ''}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2" data-testid="export-expenses-btn">
              <Download size={14}/> Export Excel
            </Button>
          </a>
          <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
            onClick={() => setShowCreate(true)} 
            className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2" 
            data-testid="create-expense-btn"
          >
            <Plus size={14}/> Record Expense
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Settled Outflow</span>
            <TrendingDown size={14} className="text-rose-500" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] mt-2 text-red-800 dark:text-red-300">
            {fmtINR(metrics.approvedTotal)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Approved &amp; reconciled
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Pending Review</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] mt-2 text-amber-800 dark:text-yellow-300">
            {fmtINR(metrics.pendingTotal)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {metrics.pendingCount} approvals awaiting decision
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Top Category</span>
            <Wallet size={14} className="text-sky-500" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] mt-2 text-slate-900 dark:text-zinc-100 truncate">
            {metrics.topCat}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Highest expense allocation
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Total Records</span>
            <FileSpreadsheet size={14} className="text-teal-800 dark:text-teal-300" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] mt-2 text-slate-900 dark:text-zinc-100">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Logged across center ledger
          </div>
        </div>
      </div>

      {/* Filter Tabs & Parameters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-wrap shrink-0">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-white/[0.04]/40 p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] overflow-x-auto custom-scrollbar">
          {STATUSES.map(s => (
            <Button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`whitespace-nowrap ${
                statusFilter === s
                  ? "bg-teal-100 dark:bg-teal-600/15 border-teal-300 dark:border-teal-600/40 text-teal-800 dark:text-teal-300 rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase border cursor-pointer transition-all duration-300"
                  : "bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase border cursor-pointer transition-all duration-300"
              }`}
            >
              {s === "all" ? "All Statuses" : s}
            </Button>
          ))}
        </div>

        {/* Category, Branch, Search */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {isSuper(erpUser) && (
            <select className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
              value={branchId} 
              onChange={e => { setBranchId(e.target.value); setPage(1); }} 
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50" 
              data-testid="filter-branch"
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
            <input type="text"
              value={q}
              onChange={handleSearchChange}
              placeholder="Search vendor, description..."
              className="bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 pl-9 pr-4 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:outline-none transition-all w-full"
              data-testid="search-expenses-input"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111] rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">From</span>
            <input type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPage(1); }}
              placeholder=""
              className="bg-transparent border-0 p-0 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none" 
            />
          </div>

          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111] rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">To</span>
            <input type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setPage(1); }}
              placeholder=""
              className="bg-transparent border-0 p-0 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] w-full flex flex-col flex-1 min-h-0">
        <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
          <table className="w-full text-sm table-fixed border-collapse min-w-[920px]">
            <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <tr className="text-left backdrop-blur-md">
                <th className="w-[12%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Date</th>
                <th className="w-[14%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Category</th>
                <th className="w-[28%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Description</th>
                <th className="w-[15%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Vendor / Party</th>
                <th className="w-[11%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Status</th>
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-slate-200/50 dark:bg-white/[0.04]">Amount</th>
                <th className="w-[8%] px-5 py-3.5 bg-slate-200/50 dark:bg-white/[0.04] text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-slate-50 dark:bg-black/20">
              {rawItems.map(e => (
                <tr key={e.id} className="hover:bg-slate-100 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.04] transition-colors group" data-testid={`exp-row-${e.id}`}>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs whitespace-nowrap text-slate-500 dark:text-zinc-400 font-mono">{fmtDate(e.expense_date)}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-white/[0.04]/60 rounded-md border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-zinc-200 font-medium text-[11px]">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs text-slate-800 dark:text-zinc-200 truncate" title={e.description}>
                    <div className="truncate font-medium">{e.description}</div>
                    {e.decision_note && (
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 italic truncate">Note: {e.decision_note}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs text-slate-500 dark:text-zinc-400 truncate" title={e.vendor}>{e.vendor || "—"}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                    <StatusBadge s={e.status} />
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 font-mono text-right font-bold text-rose-600 whitespace-nowrap text-sm">{fmtINR(e.amount)}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-right whitespace-nowrap">
                    <div className="flex gap-1.5 justify-end items-center">
                      {isManagerPlus(erpUser) && e.status === "pending" && (
                        <>
                          <Button 
                            disabled={busyRows.has(e.id)}
                            onClick={() => decide(e.id, "approve")} 
                            title="Approve & Settle" 
                            className="bg-transparent p-1.5 text-emerald-600 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-300 dark:border-emerald-500/20 rounded-lg transition disabled:opacity-40" 
                            data-testid={`approve-${e.id}`}
                          >
                            <Check size={14}/>
                          </Button>
                          <Button 
                            disabled={busyRows.has(e.id)}
                            onClick={() => decide(e.id, "reject")} 
                            title="Reject Outflow" 
                            className="bg-transparent p-1.5 text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition disabled:opacity-40" 
                            data-testid={`reject-${e.id}`}
                          >
                            <Ban size={14}/>
                          </Button>
                        </>
                      )}
                      {isSuper(erpUser) && (
                        <Button 
                          onClick={() => setDeleteModal(e)} 
                          title="Purge Expense Record" 
                          className="bg-transparent p-1.5 text-slate-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition" 
                          data-testid={`delete-expense-${e.id}`}
                        >
                          <Trash2 size={14}/>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rawItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-slate-500 dark:text-zinc-400 italic text-sm">
                    {isLoading ? "Loading expense sheets..." : "No expense records found matching current parameters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-200/50 dark:bg-white/[0.04]/30 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 shrink-0">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{rawItems.length}</span> of <span className="font-semibold text-slate-800 dark:text-zinc-200">{totalCount}</span> total items
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="bg-transparent p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || isLoading}
              className="bg-transparent p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 disabled:opacity-40 transition"
            >
              <ChevronRight size={14} />
            </Button>
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

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="font-display font-medium text-lg text-slate-800 dark:text-zinc-200">Purge Expense Record</h3>
                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to delete expense record for <strong className="text-slate-800 dark:text-zinc-200">{deleteModal.category}</strong> ({fmtINR(deleteModal.amount)})?
              {deleteModal.vendor && <span> Vendor: <strong className="text-slate-800 dark:text-zinc-200">{deleteModal.vendor}</strong></span>}
            </p>
            <div className="flex gap-2.5 pt-2">
              <Button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await erp.deleteExpense(deleteModal.id);
                    toast.success("Expense record purged successfully.");
                    queryClient.invalidateQueries();
                    setDeleteModal(null);
                  } catch (err) {
                    toast.error(formatError(err.response?.data?.detail) || "Failed to delete expense");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-rose-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13}/> {deleting ? "Purging..." : "Confirm Purge"}
              </Button>
              <Button
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ s }) {
  const norm = s?.toLowerCase() || "";
  let config = "bg-slate-200/50 dark:bg-white/[0.04]/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-white/[0.08]";
  let label = s || "Pending";

  if (norm === "approved") {
    config = "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase";
    label = "Settled";
  } else if (norm === "rejected") {
    config = "bg-rose-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-rose-300 dark:border-red-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase";
    label = "Rejected";
  } else if (norm === "pending") {
    config = "bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase";
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
  const [paymentMode, setPaymentMode] = useState("online");
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
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-200/50 dark:bg-white/[0.04]/20">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-zinc-200">Record Center Outflow</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Submit branch expenditure for approval and ledger entry</p>
          </div>
          <Button onClick={onClose} className="bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase border cursor-pointer transition-all duration-300">
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {isSuper && branches.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Branch Location *
              </label>
              <select
                value={targetBranchId}
                onChange={e => setTargetBranchId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Amount (INR) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="₹ 5,000"
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
              Description / Reason *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of goods/services procured..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Vendor / Recipient
              </label>
              <input
                type="text"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="e.g., J&K Power Dept"
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
              Receipt / Invoice Link (Optional)
            </label>
            <input
              type="url"
              value={billUrl}
              onChange={e => setBillUrl(e.target.value)}
              placeholder="https://storage... or invoice URL"
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-teal-600/90 shadow-md transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}