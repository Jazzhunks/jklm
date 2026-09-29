import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp, fmtINR, fmtDate } from "@/lib/erpApi";
import { FileSpreadsheet, ShieldCheck, AlertCircle, CheckCircle2, X, Download, Calendar, Landmark, Search, RefreshCw } from "lucide-react";

export default function GstSettlementModal({ onClose, defaultBranchId = "", branches = [] }) {
  const queryClient = useQueryClient();

  // Selected billing month (YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    return `${yr}-${mo}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Form state for challan settlement
  const [challanNo, setChallanNo] = useState("");
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("Net Banking");
  const [notes, setNotes] = useState("");

  // Generate list of past 12 months for rapid switching
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      list.push({ val, label });
    }
    return list;
  }, []);

  // Fetch monthly GST calculation from backend
  const { data: gstData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["erp-monthly-gst", selectedMonth, branchId],
    queryFn: () => erp.monthlyGst({ month: selectedMonth, branch_id: branchId || undefined }),
    keepPreviousData: true,
  });

  // Mutation to mark as paid / unpaid
  const markPaidMutation = useMutation({
    mutationFn: (body) => erp.markGstPaid(body),
    onSuccess: (data) => {
      toast.success(data?.message || "GST filing status updated successfully!");
      setShowMarkPaidForm(false);
      queryClient.invalidateQueries(["erp-monthly-gst"]);
      queryClient.invalidateQueries(["erp-payments"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail || "Failed to update GST settlement status");
    },
  });

  const filing = gstData?.filing || { status: "UNPAID" };
  const isPaid = filing.status === "PAID";
  const receipts = useMemo(() => gstData?.items || [], [gstData?.items]);

  // Filtered receipts in modal table
  const filteredReceipts = useMemo(() => {
    if (!searchFilter.trim()) return receipts;
    const q = searchFilter.toLowerCase();
    return receipts.filter(r => 
      (r.receipt_no && r.receipt_no.toLowerCase().includes(q)) ||
      (r.student_name && r.student_name.toLowerCase().includes(q)) ||
      (r.student_no && r.student_no.toLowerCase().includes(q)) ||
      (r.course_title && r.course_title.toLowerCase().includes(q))
    );
  }, [receipts, searchFilter]);

  const handleOpenMarkPaid = () => {
    if (isPaid) {
      setChallanNo(filing.challan_no || "");
      setPaidDate(filing.paid_date || new Date().toISOString().split("T")[0]);
      setPaymentMode(filing.payment_mode || "Net Banking");
      setNotes(filing.notes || "");
    } else {
      setChallanNo("");
      setPaidDate(new Date().toISOString().split("T")[0]);
      setPaymentMode("Net Banking");
      setNotes("");
    }
    setShowMarkPaidForm(true);
  };

  const handleSubmitMarkPaid = (e) => {
    e.preventDefault();
    if (!challanNo.trim()) {
      toast.error("Please enter a valid Challan / CPIN / Reference Number");
      return;
    }
    markPaidMutation.mutate({
      month: selectedMonth,
      status: "PAID",
      challan_no: challanNo.trim(),
      paid_date: paidDate,
      payment_mode: paymentMode,
      notes: notes.trim(),
      branch_id: branchId || null,
    });
  };

  const handleToggleUnpaid = () => {
    if (window.confirm(`Are you sure you want to mark GST for ${selectedMonth} as UNPAID?`)) {
      markPaidMutation.mutate({
        month: selectedMonth,
        status: "UNPAID",
        notes: "Reverted to UNPAID by administrator",
        branch_id: branchId || null,
      });
    }
  };

  const exportUrl = erp.getGstExportUrl(selectedMonth, branchId);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fadeIn" onClick={onClose} data-testid="gst-settlement-modal">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-5xl max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.08] bg-slate-200/50 dark:bg-white/[0.04]/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
              <Landmark size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-indigo-500">Government Tax Compliance</span>
                <span className="px-2 py-0.5 bg-accent/10 text-accent font-mono text-[10px] rounded-full font-bold">SAC 9992 (18%)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 text-xl sm:text-2xl mt-0.5">
                Monthly GST Calculation &amp; Filing
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => refetch()}
              className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04]/40 transition"
              title="Refresh Tax Data"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            </Button>
            <Button
              onClick={onClose}
              className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04]/40 transition"
              aria-label="Close"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Filter Toolbar: Month and Branch Selectors */}
        <div className="p-4 sm:px-6 bg-slate-200/50 dark:bg-white/[0.04]/10 border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-slate-500 dark:text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Period:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2"
                data-testid="gst-month-select"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label} ({opt.val})
                  </option>
                ))}
              </select>
            </div>

            {branches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Branch:</span>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2"
                >
                  <option value="">All Branches (Consolidated)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Action Exports */}
          <div className="flex items-center gap-2">
            <a
              href={exportUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 border border-emerald-300 dark:border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              data-testid="download-gst-excel-btn"
            >
              <FileSpreadsheet size={15} /> Download GSTR-1 Excel
            </a>
            {!isPaid ? (
              <Button
                onClick={handleOpenMarkPaid}
                className="px-3.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-teal-600/90 transition shadow-sm"
                data-testid="mark-gst-paid-btn"
              >
                <ShieldCheck size={15} /> Mark Month as Paid
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenMarkPaid}
                  className="px-3 py-1.5 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                >
                  Edit Challan
                </Button>
                <Button
                  onClick={handleToggleUnpaid}
                  className="px-3 py-1.5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                >
                  Revert to Unpaid
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Status & Challan Banner */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition ${
            isPaid 
              ? "bg-emerald-500/5 border-emerald-300 dark:border-emerald-500/20" 
              : "bg-amber-500/5 border-amber-500/20"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                isPaid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              }`}>
                {isPaid ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200">
                    {isPaid ? "GST Remittance Settled & Verified" : "Monthly Tax Liability Pending Payment"}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isPaid ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"
                  }`}>
                    {isPaid ? "PAID" : "UNPAID"}
                  </span>
                </div>
                {isPaid ? (
                  <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Challan / CIN: <strong className="font-mono text-slate-800 dark:text-zinc-200">{filing.challan_no}</strong></span>
                    <span>Remitted On: <strong className="text-slate-800 dark:text-zinc-200">{fmtDate(filing.paid_date)}</strong></span>
                    <span>Mode: <strong className="text-slate-800 dark:text-zinc-200">{filing.payment_mode}</strong></span>
                    {filing.paid_by_name && (
                      <span>Officer: <strong className="text-slate-800 dark:text-zinc-200">{filing.paid_by_name}</strong></span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Liability computed on tuition fee receipts for {selectedMonth}. GSTR-3B return &amp; PMT-06 challan must be paid to the portal by the 20th of next month.
                  </p>
                )}
              </div>
            </div>

            {!isPaid && (
              <Button
                onClick={handleOpenMarkPaid}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition shadow-sm"
              >
                Record Challan / CPIN
              </Button>
            )}
          </div>

          {/* Form Drawer / Collapsible for Recording Challan */}
          {showMarkPaidForm && (
            <form onSubmit={handleSubmitMarkPaid} className="p-5 bg-white dark:bg-[#111] border border-teal-600/30 rounded-2xl shadow-lg space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Landmark size={18} className="text-teal-800 dark:text-teal-300" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                    {isPaid ? "Update Challan Details" : "Record GST Remittance Challan"}
                  </h3>
                </div>
                <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
                  type="button" 
                  onClick={() => setShowMarkPaidForm(false)}
                  className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 text-xs"
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Challan / CPIN / CIN No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    placeholder="e.g. CPIN-2609-88194"
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Settlement Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Remittance Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2"
                  >
                    <option value="Net Banking">Net Banking (GST Portal)</option>
                    <option value="NEFT/RTGS">NEFT / RTGS (RBI Challan)</option>
                    <option value="Over The Counter (OTC)">Over The Counter (OTC)</option>
                    <option value="Treasury">Direct Treasury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  Compliance Remarks &amp; Filing Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleared via HDFC Corporate Account for Sept GSTR-3B"
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowMarkPaidForm(false)}
                  className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 w-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={markPaidMutation.isLoading}
                  className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 w-full disabled:opacity-50"
                >
                  {markPaidMutation.isLoading ? "Saving..." : "Save Settlement"}
                </Button>
              </div>
            </form>
          )}

          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08]/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Gross Invoiced
              </div>
              <div className="font-display text-2xl font-bold text-slate-800 dark:text-zinc-200 mt-1.5">
                {fmtINR(gstData?.total_gross || 0)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                {receipts.length} total receipts
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08]/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Taxable Value
              </div>
              <div className="font-display text-2xl font-bold text-slate-800 dark:text-zinc-200 mt-1.5">
                {fmtINR(gstData?.total_taxable || 0)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                Base Tuition (SAC 9992)
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08]/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
                Central GST (9%)
              </div>
              <div className="font-display text-2xl font-bold text-sky-500 mt-1.5">
                {fmtINR(gstData?.total_cgst || 0)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                CGST liability
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08]/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                State GST (9%)
              </div>
              <div className="font-display text-2xl font-bold text-indigo-500 mt-1.5">
                {fmtINR(gstData?.total_sgst || 0)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                SGST liability
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                Total GST (18%)
              </div>
              <div className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5">
                {fmtINR(gstData?.total_gst || 0)}
              </div>
              <div className="text-[10px] font-bold mt-1 text-indigo-500">
                {isPaid ? "✓ Cleared & Reconciled" : "⚠ Pending Payment"}
              </div>
            </div>
          </div>

          {/* Mode Breakdown Pills */}
          {gstData?.mode_breakdown && (
            <div className="p-4 bg-slate-200/50 dark:bg-white/[0.04]/20 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2.5">
                Collection Channel Classification
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(gstData.mode_breakdown).map(([modeName, info]) => (
                  <div key={modeName} className="p-3 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-white/[0.08]/60">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400">
                      {modeName}
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1">
                      {fmtINR(info.gross)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      GST: {fmtINR((info.cgst || 0) + (info.sgst || 0))} ({info.count} txns)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Ledger Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Monthly Tax Invoice Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Itemized tax breakups for all student fee receipts recorded in {selectedMonth}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter student or receipt..."
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 pl-8"
                />
              </div>
            </div>

            <div className="border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-200/50 dark:bg-white/[0.04]/50 sticky top-0 z-10 border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400">Date</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400">Receipt No</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400">Student</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400">Mode</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400 text-right">Gross (₹)</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400 text-right">Taxable (₹)</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400 text-right">CGST (9%)</th>
                      <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-zinc-400 text-right">SGST (9%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-zinc-400">
                          Calculating monthly GST schedules...
                        </td>
                      </tr>
                    ) : filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-zinc-400">
                          No receipts found for {selectedMonth}.
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map((r) => (
                        <tr key={r.id || r.receipt_no} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/20 transition-colors">
                          <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">{fmtDate(r.paid_at)}</td>
                          <td className="p-3 font-mono font-semibold text-teal-800 dark:text-teal-300">{r.receipt_no}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200">{r.student_name || "—"}</div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{r.student_no}</div>
                          </td>
                          <td className="p-3 uppercase font-semibold text-[10px] text-slate-500 dark:text-zinc-400">
                            {r.mode || "CASH"}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-slate-800 dark:text-zinc-200">
                            {fmtINR(r.amount)}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500 dark:text-zinc-400">
                            {fmtINR(r.base_amount)}
                          </td>
                          <td className="p-3 text-right font-mono text-sky-500">
                            {fmtINR(r.cgst)}
                          </td>
                          <td className="p-3 text-right font-mono text-indigo-500">
                            {fmtINR(r.sgst)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-200/50 dark:bg-white/[0.04]/20 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <Landmark size={14} className="text-indigo-500" />
            <span>State GST Jurisdiction: Jammu &amp; Kashmir (Code 01)</span>
          </div>

          <Button
            onClick={onClose}
            className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
