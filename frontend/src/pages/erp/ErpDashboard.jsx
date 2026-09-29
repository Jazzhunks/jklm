import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { erp, isSuper, isFinance, isManagerPlus, fmtINR, fmtDate, extractItems, STUDENT_CLASSES, STUDENT_COURSES, getValidCoursesForClass } from "@/lib/erpApi";
import { formatError, api, API_BASE } from "@/lib/api";
import FeeMatrixConfigModal from "./modals/FeeMatrixConfigModal";
import LeadActivityDrawer from "./modals/LeadActivityDrawer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, AlertCircle, Plus, IndianRupee, Wallet, Download, Search, X, Check, Ban, Layers, MessageSquare, Clock } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";

// --- CORE SYSTEM MATRIX CONFIGS ---
const EXP_CATEGORIES = ["Salary", "Rent", "Electricity", "Internet", "Marketing", "Maintenance", "Miscellaneous"];
const CHART_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#f472b6'];

// --- SHARED UI COMPONENT BLOCKS ---
const Stat = ({ label, value, icon: Icon, accent, testid }) => (
  <div 
    className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms] relative overflow-hidden group" data-testid={testid}
  >
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-teal-600/10 group-hover:border-teal-600/20 transition-all duration-300">
        {Icon && <Icon size={18} className={accent || "text-slate-600 dark:text-zinc-400"} strokeWidth={1.5} />}
      </div>
    </div>
    <div className="relative z-10 flex flex-col-reverse">
      <div className={`font-mono text-[26px] font-bold tracking-[-0.02em] mt-1.5 text-slate-900 dark:text-zinc-100`}>
        {value}
      </div>
      <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">{label}</div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-50 dark:bg-black/95 border border-slate-200 dark:border-white/[0.08] p-4 rounded-xl shadow-xl backdrop-blur-md z-50">
        <p className="font-bold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 text-sm mb-1 last:mb-0">
            <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
            <span className="font-mono font-bold">{fmtINR(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// MAIN DASHBOARD PLATFORM CONSOLE CONTAINER
// ============================================================================
export default function ErpDashboard() {
  const nav = useNavigate();
  const { erpUser, selectedBranchId } = useOutletContext();
  const [data, setData] = useState(null);
  const [dashboardLeads, setDashboardLeads] = useState([]);
  const [leadTab, setLeadTab] = useState("all");
  const [err, setErr] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showFeeMatrix, setShowFeeMatrix] = useState(false); // 'admission' | 'expense' | 'cashbook' | 'students' | 'outflow' | 'duelist'

  const refreshDashboard = () => {
    setData(null); setErr(null);
    let p;
    if (isSuper(erpUser)) {
      p = selectedBranchId ? erp.branchDashboard(selectedBranchId) : erp.superDashboard();
    } else {
      p = erp.branchDashboard(erpUser.branch_id);
    }
    p.then(setData).catch(e => setErr(formatError(e.response?.data?.detail) || "Failed to load"));
  };

  useEffect(() => { refreshDashboard(); }, [erpUser, selectedBranchId]);

  if (err) return (
    <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="erp-dashboard-error">
      <AlertCircle size={48} className="text-destructive mb-4" />
      <h2 className="text-xl font-bold">Dashboard Error</h2>
      <p className="text-slate-500 dark:text-zinc-400 mt-2">{err}</p>
    </div>
  );
  
  if (!data) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse p-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-2xl"></div>)}
    </div>
  );

  const canSeeFinance = isFinance(erpUser);

  return (
    <div className="p-1 sm:p-6 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="w-full md:w-auto">
          <div className="text-[10px] tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 rounded-full px-3 py-1 inline-flex items-center gap-1.5 w-fit">
            {isSuper(erpUser) ? "Operations Console" : "Centre Console"}
          </div>
          <h1 className="text-[32px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100 mt-3 break-words">
            {isSuper(erpUser) ? "Network Overview" : data.branch?.name}
          </h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-2 max-w-xl leading-relaxed">
            {isSuper(erpUser) 
              ? `Live operational metrics across ${data.total_branches} learning branches.` 
              : `${data.branch?.address || "Active Learning Center Execution Layer Branch."}`}
          </p>
        </div>

        {/* Command Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Button onClick={() => setActiveModal("duelist")} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
            <Clock size={14} /> <span className="whitespace-nowrap">Today's Dues</span>
          </Button>
          {erpUser.role !== "counsellor" && (
            <Button onClick={() => nav("/erp/admission")} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
              <Plus size={14} /> <span className="whitespace-nowrap">New Admission</span>
            </Button>
          )}
          {isSuper(erpUser) && (
            <Button onClick={() => setShowFeeMatrix(true)} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
              <span className="whitespace-nowrap">Fee Matrix</span>
            </Button>
          )}
          {canSeeFinance && (
            <Button onClick={() => setActiveModal("expense")} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
              <Wallet size={14} /> <span className="whitespace-nowrap">Add Expense</span>
            </Button>
          )}
          <Button onClick={() => setActiveModal("students")} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
            <Users size={14} /> <span className="whitespace-nowrap">Records</span>
          </Button>
          {canSeeFinance && (
            <Button onClick={() => setActiveModal("cashbook")} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
              <IndianRupee size={14} /> <span className="whitespace-nowrap">Cashbook</span>
            </Button>
          )}
          {canSeeFinance && (
            <Button onClick={() => setActiveModal("outflow")} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1.5">
              <Layers size={14} /> <span className="whitespace-nowrap">Outflow</span>
            </Button>
          )}
        </div>
      </div>

      {/* CORE STATISTICAL MONITORING LAYER */}
      {isSuper(erpUser) ? (
        <SuperView d={data} leads={data?.leads || []} leadTab={leadTab} setLeadTab={setLeadTab} refreshDashboard={refreshDashboard} />
      ) : (
        <BranchView d={data} canSeeFinance={canSeeFinance} />
      )}

      {/* CONTROL SHEETS PORTALS */}
      {showFeeMatrix && <FeeMatrixConfigModal onClose={() => setShowFeeMatrix(false)} />}
      {activeModal === "admission" && (
        <CreateStudentModal erpUser={erpUser} onClose={() => setActiveModal(null)} onCreated={() => { setActiveModal(null); refreshDashboard(); }} />
      )}
      {activeModal === "expense" && (
        <CreateExpenseModal erpUser={erpUser} onClose={() => setActiveModal(null)} onCreated={() => { setActiveModal(null); refreshDashboard(); }} />
      )}
      {activeModal === "cashbook" && canSeeFinance && (
        <CashbookViewModal erpUser={erpUser} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "students" && (
        <StudentsViewModal erpUser={erpUser} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "outflow" && canSeeFinance && (
        <ExpensesViewModal erpUser={erpUser} onClose={() => setActiveModal(null)} refreshRoot={refreshDashboard} />
      )}
      {activeModal === "duelist" && (
        <TodayDueListModal erpUser={erpUser} onClose={() => setActiveModal(null)} />
      )}

    </div>
  );
}

// ============================================================================
// TODAY'S STUDENT FEE DUE MONITORING INTERFACE SLIDE SHEET
// ============================================================================
function TodayDueListModal({ erpUser, onClose }) {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = isSuper(erpUser) ? {} : { branch_id: erpUser.branch_id };
    
    erp.listStudents(params)
      .then(async (res) => {
        try {
          const studentList = extractItems(res);
          const resolvedStatements = await Promise.all(
            studentList.map(async (student) => {
              try {
                const statement = await erp.studentStatement(student.id);
                return {
                  ...student,
                  computedPending: Number(statement.pending || 0),
                  computedNet: Number(statement.net_fee || 0),
                  computedPaid: Number(statement.total_paid || 0)
                };
              } catch {
                const rawTotal = Number(student.total_fee || 0);
                const rawPaid = Number(student.paid_fee || 0); 
                return {
                  ...student,
                  computedPending: Math.max(0, rawTotal - rawPaid),
                  computedNet: rawTotal,
                  computedPaid: rawPaid
                };
              }
            })
          );

          const activeDues = resolvedStatements.filter(s => s.computedPending > 0);
          activeDues.sort((a, b) => b.computedPending - a.computedPending);
          setDues(activeDues);
        } catch (err) {
          toast.error("Error processing financial sub-ledger matrix records");
        }
      })
      .catch(() => toast.error("Failed to parse directory network tracking streams"))
      .finally(() => setLoading(false));
  }, [erpUser]);

  const triggeringWhatsAppNudge = (student) => {
    const textMessage = `Dear Parent,\n\nThis is an official tracking reminder from Northend Educational World regarding the pending academic installment fee balance of ${fmtINR(student.computedPending)} for your child ${student.full_name} (${student.student_no}).\n\nKindly arrange for the collection balance settlement at your nearest center desk layer.\n\nThank you,\nAdministration Management Console`;
    const targetPhone = student.parent_phone || student.contact_phone || "";
    
    if (!targetPhone) {
      toast.error("No valid communication parameters found for this profile record");
      return;
    }
    
    window.open(`https://wa.me/${targetPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(textMessage)}`, "_blank");
  };

  const runtimeFilteredDues = dues.filter(d => 
    d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.student_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-slate-50 dark:bg-black border-l border-slate-200 dark:border-white/[0.08] w-full max-w-2xl h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                <Clock size={12}/> Installment Balance Core Console
              </div>
              <h2 className="font-display text-3xl font-light tracking-tight mt-1">Due Tracking Register</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Live algorithmic compilation matching isolated backend statement states.</p>
            </div>
            <Button onClick={onClose} className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition"><X size={16}/></Button>
          </div>

          <div className="relative w-full shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
            <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
              type="text"
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search due tracking fields by student parameter or ID string..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/50 rounded-xl text-sm focus:outline-none focus:border-amber-500/40 transition font-sans text-slate-800 dark:text-zinc-200"
            />
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20 text-center">
              <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-slate-500 dark:text-zinc-400 text-xs font-mono tracking-wider uppercase">Evaluating global collection statements matrix...</div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl border border-slate-200 dark:border-white/[0.08] flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 sticky top-0 backdrop-blur-md z-10 border-b border-slate-200 dark:border-white/[0.08]">
                  <tr className="text-left">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Academic Record Profile</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Outstanding Deficit</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {runtimeFilteredDues.map(s => (
                    <tr key={s.id} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm group-hover:text-amber-800 dark:text-amber-400/90 transition-colors">{s.full_name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2 divide-x divide-border/30">
                          <span>{s.student_no}</span>
                          <span className="pl-2">Batch: {s.batch || "Unallocated"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-right font-bold text-sm text-rose-600">
                        {fmtINR(s.computedPending)}
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal tracking-wide mt-0.5">
                          Paid: {fmtINR(s.computedPaid)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
                          onClick={() => triggeringWhatsAppNudge(s)} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition duration-300 border border-emerald-500/10 shadow-sm"
                        >
                          <MessageSquare size={13}/> Nudge
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {runtimeFilteredDues.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-5 py-16 text-center text-slate-500 dark:text-zinc-400 italic text-sm">
                        No outstanding student due records located under validation rules.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ============================================================================
// SYSTEM WORKSTATIONS SUB-CONSOLES (SUPER / BRANCH AGGREGATES)
// ============================================================================
function SuperView({ d, leads, leadTab, setLeadTab, refreshDashboard }) {
  const [deleteModal, setDeleteModal] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteLead = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await erp.deleteLead(deleteModal.id);
      refreshDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };
  const filteredLeads = (leads || []).filter(l => {
    if (leadTab === "all") return true;
    if (leadTab === "new") return l.status === "new";
    if (leadTab === "pending") return ["follow_up", "pending_approval"].includes(l.status);
    if (leadTab === "converted") return l.status === "converted";
    return true;
  }).slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Stat label="Total Revenue" value={fmtINR(d.total_revenue)} icon={TrendingUp} accent="text-emerald-800 dark:text-emerald-300" testid="stat-revenue"/>
        <Stat label="Total Expense" value={fmtINR(d.total_expense)} icon={TrendingDown} accent="text-red-800 dark:text-red-300" testid="stat-expense"/>
        <Stat label="Net Income" value={fmtINR(d.net_income)} icon={Wallet} accent={d.net_income >= 0 ? "text-teal-800 dark:text-teal-300" : "text-red-800 dark:text-red-300"} testid="stat-net"/>
        <Stat label="Pending Fees" value={fmtINR(d.total_pending_fees)} icon={AlertCircle} accent="text-amber-800 dark:text-yellow-300" testid="stat-pending"/>
      </div>

      {/* 2-col lower */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Prospect Leads */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px]">
          <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4 shrink-0">
              <div>
                <div className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100">Prospect Leads</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Admissions CRM pipeline</div>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["all", "new", "pending", "converted"].map(tab => (
                  <Button
                    key={tab}
                    onClick={() => setLeadTab(tab)}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase border transition-all duration-300 ${
                      leadTab === tab
                        ? "bg-teal-100 dark:bg-teal-600/15 border-teal-300 dark:border-teal-600/40 text-teal-800 dark:text-teal-300"
                        : "bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200"
                    }`}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/[0.06]">Lead Name</th>
                    <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/[0.06]">Phone</th>
                    <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/[0.06]">Class Target</th>
                    <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/[0.06]">Stage</th>
                    <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/[0.06] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04]">
                  {filteredLeads.map(l => (
                    <tr key={l.id} onClick={() => setSelectedLead(l)} className="hover:bg-slate-100 dark:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-200 text-[13px]">{l.name}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-slate-600 dark:text-zinc-400">{l.phone}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-zinc-400">{l.course_id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.05em] uppercase border ${
                          l.status === 'new' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/20' :
                          l.status === 'converted' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/20' :
                          l.status === 'lost' ? 'bg-rose-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-rose-300 dark:border-red-500/20' :
                          'bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/20'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <Button onClick={() => setSelectedLead(l)} className="bg-transparent border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 rounded-lg px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase transition-all">Edit</Button>
                          <Button onClick={() => setDeleteModal(l)} className="bg-transparent border border-rose-300 dark:border-red-500/20 text-red-800 dark:text-red-300 hover:border-red-500/40 hover:bg-red-500/10 rounded-lg px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase transition-all">Del</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-[12px] text-slate-500 dark:text-zinc-400">No leads found for this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.05]">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">Showing top {filteredLeads.length} leads</span>
              <Button onClick={() => window.location.href = '/erp/leads'} className="bg-transparent border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase transition-all duration-300">
                View All →
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Financial & Branches */}
        <div className="flex flex-col gap-5">
          {/* Mini Bar Chart */}
          <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px]">
            <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5">
              <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 dark:text-zinc-400 mb-3">Financial Overview</div>
              <div className="h-[100px] w-full min-w-0" style={{ minWidth: 0, minHeight: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.branches || []} margin={{ top: 0, right: 0, left: -20, bottom: -10 }}>
                    <XAxis dataKey="branch_name" hide />
                    <YAxis hide />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="revenue" fill="rgba(13,148,136,0.55)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px]">
            <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5">
              <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 dark:text-zinc-400 mb-3">Active Students</div>
              <div className="text-[40px] font-bold text-slate-900 dark:text-zinc-100 font-mono tracking-[-0.03em] leading-none">{d.total_students}</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5">Across {d.total_branches} branches</div>
              
              <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] rounded-[10px] p-2.5">
                  <div className="text-[18px] font-bold text-teal-500 font-mono">{d.total_students}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Enrolled</div>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] rounded-[10px] p-2.5">
                  <div className="text-[18px] font-bold text-amber-800 dark:text-amber-400 font-mono">{(d.total_students * 0.1).toFixed(0)}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Dues Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Branches */}
          <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px]">
            <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5">
              <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 dark:text-zinc-400 mb-3">Network Branches</div>
              <div className="flex flex-col gap-2">
                {(d.branches || []).slice(0, 5).map(b => (
                  <div key={b.branch_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-teal-100 dark:bg-teal-600/15 flex items-center justify-center text-[8px] font-bold text-teal-500">
                        {b.branch_name.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-[12px] text-slate-600 dark:text-zinc-400">{b.branch_name}</span>
                    </div>
                    <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Lead Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 backdrop-blur-sm transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]" onClick={() => !deleting && setDeleteModal(null)}>
          <div className="bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[24px] max-w-sm w-full p-6 text-center shadow-2xl scale-100" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 dark:text-zinc-100 mb-2">Delete Lead?</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-zinc-200">{deleteModal.name}</strong>?
            </p>
            <div className="flex gap-3">
              <Button disabled={deleting} onClick={() => setDeleteModal(null)} className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300">
                Cancel
              </Button>
              <Button disabled={deleting} onClick={handleDeleteLead} className="flex-1 bg-red-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(220,38,38,0.5),0_4px_16px_rgba(220,38,38,0.25)] hover:bg-red-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete Lead"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(selectedLead) && (function(){ const liveLead = leads?.find(l => l.id === selectedLead.id) || selectedLead; return <LeadActivityDrawer lead={liveLead} onClose={() => setSelectedLead(null)} onInteractionAdded={(interaction) => { setSelectedLead(prev => ({ ...prev, interactions: [...(prev.interactions || []), interaction] })); if (refreshDashboard) refreshDashboard(); }} />; })()}
    </div>
  );
}function BranchView({ d, canSeeFinance }) {
  const expenseData = Object.entries(d.expense_by_category || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {canSeeFinance && (
          <>
            <Stat label="Gross Revenue" value={fmtINR(d.revenue)} icon={TrendingUp} accent="text-emerald-800 dark:text-emerald-300" testid="stat-revenue"/>
            <Stat label="Total Expense" value={fmtINR(d.expense)} icon={TrendingDown} accent="text-red-800 dark:text-red-300" testid="stat-expense"/>
          </>
        )}
        <Stat label="Pending Fees" value={fmtINR(d.pending_fees)} icon={AlertCircle} accent="text-amber-800 dark:text-yellow-300" testid="stat-pending"/>
        <Stat label="Active Students" value={d.student_count} icon={Users} accent="text-sky-700 dark:text-sky-400" testid="stat-students"/>
      </div>

      <div className={`grid grid-cols-1 ${canSeeFinance ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-5`}>
        {canSeeFinance && (
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl p-6 flex flex-col border border-slate-200 dark:border-white/[0.08]" data-testid="expense-breakdown">
            <h3 className="font-display font-medium text-lg mb-2">Expense Distribution</h3>
            {expenseData.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-zinc-400 text-sm italic py-10">No approved expenses to chart.</div>
            ) : (
              <div className="h-[280px] w-full min-w-0 mt-4" style={{ minWidth: 0, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0.2)"/>
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl p-6 flex flex-col border border-slate-200 dark:border-white/[0.08]" data-testid="counsellor-performance">
          <h3 className="font-display font-medium text-lg mb-2">Counsellor Conversion</h3>
          {(d.counsellor_performance || []).length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-zinc-400 text-sm italic py-10">No counsellor data available.</div>
          ) : (
            <div className="h-[280px] w-full min-w-0 mt-4" style={{ minWidth: 0, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={d.counsellor_performance} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}}/>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                  <Bar dataKey="leads" name="Total Leads" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="converted" name="Converted" fill="#34d399" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {d.recent_payments?.length > 0 && (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] animate-fadeIn" data-testid="recent-payments">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <h3 className="font-display font-medium text-lg">Latest Center Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-200/50 dark:bg-white/[0.04]">
                <tr className="text-left text-slate-500 dark:text-zinc-400">
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Receipt No.</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Student Enrollment</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Payment Mode</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {d.recent_payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">{p.receipt_no}</td>
                    <td className="px-6 py-4 font-medium">{p.student_no}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-slate-200/50 dark:bg-white/[0.04]/50 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400">
                        {p.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-right text-emerald-600 font-medium">{fmtINR(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// MODAL PORTS & SLIDE-OVER CONSOLE RENDERS
// ============================================================================

function CashbookViewModal({ erpUser, onClose }) {
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => { erp.listBranches().then(setBranches); }, []);
  useEffect(() => {
    const params = {};
    if (branchId) params.branch_id = branchId;
    if (from) params.from_date = from;
    if (to) params.to_date = to;
    erp.listPayments(params).then(res => setItems(extractItems(res)));
  }, [branchId, from, to]);

  const total = items.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-slate-50 dark:bg-black border-l border-slate-200 dark:border-white/[0.08] w-full max-w-4xl h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-accent flex items-center gap-1.5">Realtime Cashbook Log</div>
              <h2 className="font-display text-3xl font-light tracking-tight mt-1">Fee Collections</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">{items.length} records • Aggregate total {fmtINR(total)}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={`${API_BASE}/erp/exports/payments.xlsx`} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition">
                <Download size={16}/>
              </a>
              <Button onClick={onClose} className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition"><X size={16}/></Button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {isSuper(erpUser) && (
              <select value={branchId} onChange={e => setBranchId(e.target.value)} className="border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 bg-slate-50 dark:bg-black/50 text-sm flex-1 min-w-[150px]">
                <option value="">All branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 bg-slate-50 dark:bg-black/50 text-sm flex-1"/>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 bg-slate-50 dark:bg-black/50 text-sm flex-1"/>
          </div>

          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Receipt</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Mode</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Collector</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map(p => (
                    <tr key={p.id} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{p.receipt_no}</td>
                      <td className="px-4 py-3 text-xs">{fmtDate(p.paid_at)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.student_no}</td>
                      <td className="px-4 py-3 text-xs uppercase"><span className="px-1.5 py-0.5 bg-slate-200/50 dark:bg-white/[0.04]/50 rounded text-[10px] font-bold">{p.mode}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-zinc-400">{p.collected_by_name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-emerald-600">{fmtINR(p.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <a href={`/rec%2F${encodeURIComponent(p.receipt_no)}`} target="_blank" rel="noreferrer" className="text-accent text-xs font-bold hover:underline">PDF</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StudentsViewModal({ erpUser, onClose }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => { erp.listBranches().then(setBranches); }, []);
  useEffect(() => {
    const params = {};
    if (q) params.q = q;
    if (branchId) params.branch_id = branchId;
    erp.listStudents(params).then(res => setItems(extractItems(res)));
  }, [q, branchId]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-slate-50 dark:bg-black border-l border-slate-200 dark:border-white/[0.08] w-full max-w-5xl h-full p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-accent flex items-center gap-1.5">Active Operational Database</div>
            <h2 className="font-display text-3xl font-light tracking-tight mt-1">Student Directory</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">{items.length} records active under framework execution roles.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${API_BASE}/erp/exports/students.xlsx`} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition">
              <Download size={16}/>
            </a>
            <Button onClick={onClose} className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition"><X size={16}/></Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
            <input value={q} onChange={e => setQ(setQ.target.value)} placeholder="Search by full name, registration number, phone..." className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/50 rounded-xl text-sm"/>
          </div>
          {isSuper(erpUser) && (
            <select value={branchId} onChange={e => setBranchId(e.target.value)} className="border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 bg-slate-50 dark:bg-black/50 text-sm min-w-[180px]">
              <option value="">All network centres</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400">
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Student ID</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Contact Line</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Assigned Branch</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Committed Fee</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Admission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(s => (
                  <tr key={s.id} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-zinc-400">{s.student_no}</td>
                    <td className="px-4 py-3 font-bold">{s.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.contact_phone}</td>
                    <td className="px-4 py-3 text-xs">{branches.find(b => b.id === s.branch_id)?.name || s.branch_id?.slice(0,8)}</td>
                    <td className="px-4 py-3 font-mono text-right text-sky-700 dark:text-sky-400 font-medium">{fmtINR(s.total_fee)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-zinc-400">{fmtDate(s.admission_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

// 3. EXPENSES SHEET LAYERING CONSOLE (SCROLL-FIXED)
function ExpensesViewModal({ erpUser, onClose, refreshRoot }) {
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const sync = () => {
    const params = {};
    if (branchId) params.branch_id = branchId;
    if (statusFilter) params.status = statusFilter;
    erp.listExpenses(params).then(res => setItems(extractItems(res)));
  };

  useEffect(() => { erp.listBranches().then(setBranches); }, []);
  useEffect(() => { sync(); }, [branchId, statusFilter]);

  const handleDecision = async (id, decision) => {
    try {
      await erp.decideExpense(id, { decision });
      toast.success(`Outflow item marked as ${decision}d`);
      sync();
      refreshRoot();
    } catch (e) { toast.error(formatError(e.response?.data?.detail) || "Operation failed"); }
  };

  const total = items.filter(e => e.status === "approved").reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className="bg-slate-50 dark:bg-black border-l border-slate-200 dark:border-white/[0.08] w-full max-w-5xl h-full p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
      >
        <div className="space-y-6 flex flex-col h-full min-h-0">
          
          {/* Header Section (Pinned) */}
          <div className="flex justify-between items-start shrink-0">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-accent flex items-center gap-1.5">Outflow Reporting Matrix</div>
              <h2 className="font-display text-3xl font-light tracking-tight mt-1">Expense Sheets</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
                {items.length} entries registered • Total approved execution: <span className="text-rose-600 font-bold">{fmtINR(total)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a href={`${API_BASE}/erp/exports/expenses.xlsx`} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition">
                <Download size={16}/>
              </a>
              <Button onClick={onClose} className="p-2 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition"><X size={16}/></Button>
            </div>
          </div>

          {/* Filters Section (Pinned) */}
          <div className="flex gap-3 flex-wrap shrink-0">
            {isSuper(erpUser) && (
              <select value={branchId} onChange={e => setBranchId(e.target.value)} className="border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 bg-slate-50 dark:bg-black/50 text-sm flex-1 min-w-[150px] focus:outline-none text-slate-800 dark:text-zinc-200">
                <option value="">All branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 bg-slate-50 dark:bg-black/50 text-sm flex-1 min-w-[150px] focus:outline-none text-slate-800 dark:text-zinc-200">
              <option value="">All statuses</option>
              <option value="pending">Pending Verification</option>
              <option value="approved">Approved & Settled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Table Container Layer (Hard-Bound Calculation Height Grid) */}
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl border border-slate-200 dark:border-white/[0.08] w-full overflow-hidden flex flex-col h-[calc(100vh-240px)] min-h-0">
            <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
              <table className="w-full text-sm table-auto border-collapse">
                <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                  <tr className="text-left backdrop-blur-md">
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Date</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Category</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Description</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Vendor/Party</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Status</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-slate-200/50 dark:bg-white/[0.04]">Amount</th>
                    <th className="px-4 py-3.5 bg-slate-200/50 dark:bg-white/[0.04]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-slate-50 dark:bg-black/20">
                  {items.map(e => (
                    <tr key={e.id} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition-colors group">
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap text-slate-500 dark:text-zinc-400">{fmtDate(e.expense_date)}</td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-md border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-zinc-200 font-medium">{e.category}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-normal text-slate-800 dark:text-zinc-200 max-w-xs truncate" title={e.description}>{e.description}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-zinc-400 max-w-[150px] truncate" title={e.vendor}>{e.vendor || "—"}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge s={e.status}/></td>
                      <td className="px-4 py-3.5 font-mono text-right font-bold text-rose-600 whitespace-nowrap">{fmtINR(e.amount)}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {isManagerPlus(erpUser) && e.status === "pending" && (
                          <div className="flex gap-1.5 justify-end">
                            <Button onClick={() => handleDecision(e.id, "approve")} className="p-1 text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500/0 hover:border-emerald-300 dark:border-emerald-500/20 rounded-lg transition duration-200"><Check size={14}/></Button>
                            <Button onClick={() => handleDecision(e.id, "reject")} className="p-1 text-rose-600 hover:bg-rose-500/10 border border-rose-500/0 hover:border-rose-500/20 rounded-lg transition duration-200"><Ban size={14}/></Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-16 text-center text-slate-500 dark:text-zinc-400 italic tracking-wide text-sm">
                        No financial outflow statements logged under variable matrix parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function CreateExpenseModal({ erpUser, onClose, onCreated }) {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    branch_id: isSuper(erpUser) ? "" : erpUser.branch_id,
    category: "Salary", amount: "", description: "", vendor: "", expense_date: new Date().toISOString().slice(0,10),
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isSuper(erpUser)) erp.listBranches().then(setBranches); }, []);

  const executeSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await erp.createExpense({ ...form, amount: Number(form.amount) });
      toast.success("Expense ledger statement logged successfully");
      onCreated();
    } catch (e) { toast.error(formatError(e.response?.data?.detail) || "Failed to commit sheet"); }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/20 z-50 grid place-items-center p-4 sm:p-6 backdrop-blur-md animate-fadeIn transition-all" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={executeSubmit} className="bg-slate-50 dark:bg-black/95 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08]/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-accent flex items-center gap-1.5">Auditing &amp; Balances</div>
            <h3 className="font-display text-2xl font-medium mt-1">Record Cost Outflow</h3>
          </div>
          <Button type="button" onClick={onClose} className="p-1 hover:bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-lg"><X size={18}/></Button>
        </div>

        {isSuper(erpUser) && (
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Allocation Center Target *</label>
            <select required value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-sm focus:outline-none">
              <option value="">— Select Target Center —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Expense Functional Category *</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black rounded-xl text-sm focus:outline-none">
            {EXP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <InputCard label="Outflow Valued Amount (INR) *" type="number" v={form.amount} on={v => setForm({...form, amount: v})} req />
        <InputCard label="Ledger Statement Description *" v={form.description} on={v => setForm({...form, description: v})} req />
        <div className="grid grid-cols-2 gap-3">
          <InputCard label="Recipient Vendor / Party" v={form.vendor} on={v => setForm({...form, vendor: v})} />
          <InputCard label="Transaction Date *" type="date" v={form.expense_date} on={v => setForm({...form, expense_date: v})} req />
        </div>
        <Button disabled={busy} type="submit" className="w-full w-full py-2.5 mt-2 rounded-xl bg-teal-600 text-white text-[13px] font-medium transition-all duration-200 border border-teal-600/20 shadow-sm hover:bg-teal-600/90 hover:shadow-md active:scale-[0.98]">{busy ? "Writing Matrix State…" : "Commit Cost Outflow Statement"}</Button>
      </form>

    </div>
  );
}

function StatusBadge({ s }) {
  const meta = {
    approved: "bg-emerald-500/10 text-emerald-600 border border-emerald-300 dark:border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20",
    rejected: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${meta[s] || ""}`}>{s}</span>;
}

function InputCard({ label, v, on, type = "text", req, placeholder }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">{label}{req && " *"}</label>
      <input type={type} value={v} required={req} placeholder={placeholder} onChange={e => on(e.target.value)} className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.08]/40 bg-slate-200/50 dark:bg-white/[0.04]/10 hover:bg-slate-200/50 dark:bg-white/[0.04]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 font-mono text-slate-800 dark:text-zinc-200 placeholder:text-slate-500 dark:text-zinc-400/40 transition-all" />

    </div>
  );
}

function SelectCard({ label, v, on, opts, req, disabled }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">{label}{req && " *"}</label>
      <select value={v} onChange={e => on(e.target.value)} required={req} disabled={disabled} className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.08]/40 bg-slate-200/50 dark:bg-white/[0.04]/10 hover:bg-slate-200/50 dark:bg-white/[0.04]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 disabled:opacity-50 transition-all appearance-none cursor-pointer">
        {req && <option value="">— Select Option Layer —</option>}
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>

    </div>
  );
}