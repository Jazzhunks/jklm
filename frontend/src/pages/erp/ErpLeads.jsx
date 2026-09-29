import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import LeadActivityDrawer from "@/pages/erp/modals/LeadActivityDrawer";
import LeadProposeModal from "@/pages/erp/modals/LeadProposeModal";
import LeadReviewModal from "@/pages/erp/modals/LeadReviewModal";
import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";
import LeadTransferModal from "@/pages/erp/modals/LeadTransferModal";

import { isFinance, STUDENT_CLASSES } from "@/lib/erpApi";
import { erp, isSuper, isManagerPlus, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { formatError, api } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Target } from "lucide-react";
import { Plus, X, Search, MessageSquare, List, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Trash2, AlertTriangle } from "lucide-react";

const STAGES = [
  { id: "new", label: "New Leads", color: "sky", style: "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/20" },
  { id: "contacted", label: "Contacted", color: "indigo", style: "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/20" },
  { id: "follow_up", label: "Follow-Up", color: "amber", style: "bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/20" },
  { id: "pending_approval", label: "Pending Approval", color: "fuchsia", style: "bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/20" },
  { id: "approved_for_accounts", label: "Accounts Handoff", color: "orange", style: "bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/20" },
  { id: "converted", label: "Converted", color: "emerald", style: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/20" },
  { id: "lost", label: "Closed / Lost", color: "rose", style: "bg-rose-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-rose-300 dark:border-red-500/20" },
];

export default function ErpLeads() {
  const { erpUser, selectedBranchId, academicConfig } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // View mode
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'table'

  // Filters
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(searchParams.get("action") === "new");
  const [selectedLead, setSelectedLead] = useState(null);
  const [proposeModalLead, setProposeModalLead] = useState(null);
  const [reviewModalLead, setReviewModalLead] = useState(null);
  const [enrollModalLead, setEnrollModalLead] = useState(null);
  const [transferModalLead, setTransferModalLead] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 25;

  // Sync branch
  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setBranchId(selectedBranchId);
      setPage(1);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    setShowCreate(searchParams.get("action") === "new");
  }, [searchParams]);

  const { data: branches = [] } = useQuery({
    queryKey: ['erp-branches'],
    queryFn: () => erp.listBranches(),
  });

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['erp-leads', branchId, search, statusFilter, viewMode, page],
    queryFn: async () => {
      const params = { skip: (page - 1) * limit, limit };
      if (search) params.search = search;
      if (branchId) params.branch_id = branchId;
      if (statusFilter !== "all") params.status = statusFilter;
      return erp.listLeads(params);
    },
    keepPreviousData: true,
  });

  const items = extractItems(leadsData);
  const totalCount = extractTotal(leadsData);
  const totalPages = leadsData?.pages || Math.max(Math.ceil(totalCount / limit), 1);

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

  const reload = () => queryClient.invalidateQueries(['erp-leads']);

  // Quick Lead Stage Update
  const updateStage = async (leadId, newStatus) => {
    try {
      await erp.updateLead(leadId, { status: newStatus });
      toast.success(`Pipeline updated: Moved to ${newStatus.replace("_", " ").toUpperCase()}`);
      reload();
    } catch (err) {
      toast.error(formatError(err) || "Failed to update pipeline stage");
    }
  };

  // WhatsApp trigger to prospect
  const openWhatsApp = (lead) => {
    const phone = (lead.phone || "").replace(/[^0-9]/g, "");
    if (!phone) {
      toast.error("No phone number recorded for this prospect");
      return;
    }
    const txt = `Hello ${lead.name},\n\nThank you for your inquiry with Northend Educational World regarding our coaching programs. How can we assist you today?\n\nAcademic Admissions Desk`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  // Group items by stage for Kanban
  const stageBuckets = useMemo(() => {
    const buckets = {};
    STAGES.forEach(s => { buckets[s.id] = []; });
    items.forEach(lead => {
      const st = lead.status || "new";
      if (buckets[st]) buckets[st].push(lead);
      else buckets["new"]?.push(lead);
    });
    return buckets;
  }, [items]);

  return (
    <div className="space-y-6 flex flex-col min-h-0 animate-fadeIn bg-slate-50 dark:bg-black" data-testid="erp-leads-page">
      {/* Header Deck */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Admissions CRM &amp; Pipeline</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Prospect Leads</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">
            Lead stage progression, counsellor follow-ups, and automated student conversions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
            onClick={() => setShowCreate(true)} 
            className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2" 
            data-testid="create-lead-btn"
          >
            <Plus size={14}/> Add Prospect
          </Button>
        </div>
      </div>

      {/* Query Filter System */}
      <div className="flex gap-2 flex-wrap items-center justify-between shrink-0">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
          <input type="text"
            value={q} 
            onChange={handleSearchChange} 
            placeholder="Search leads..." 
            className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-9 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" 
            data-testid="search-leads-input"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
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

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
          >
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main View Area (List Only) */}
      <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] w-full flex flex-col flex-1 min-h-0">
        <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
            <table className="w-full text-sm table-fixed border-collapse min-w-[880px]">
              <thead className="sticky top-0 z-20 bg-white dark:bg-[#111]">
                <tr className="text-left">
                  <th className="w-[18%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Lead Name</th>
                  <th className="w-[15%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Phone</th>
                  <th className="w-[14%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Class Target</th>
                  <th className="w-[14%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Stage</th>
                  <th className="w-[25%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Remarks</th>
                  <th className="w-[14%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04]">
                {items.map(l => (
                  <tr key={l.id} onClick={() => setSelectedLead(l)} className="hover:bg-slate-100 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.04] last:border-0 transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group cursor-pointer">
                    <td className="py-3 px-4 text-[13px] text-slate-800 dark:text-zinc-200 font-medium truncate">{l.name}</td>
                    <td className="py-3 px-4 text-[13px] font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">{l.phone}</td>
                    <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 truncate">{l.moving_to_class || l.present_class || "—"}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`border rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase ${
                        STAGES.find(s => s.id === l.status)?.style || "border-slate-200 dark:border-white/[0.08] bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 truncate" title={l.remarks}>{l.remarks || "—"}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap pr-6">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <Button
                          onClick={() => openWhatsApp(l)}
                          title="WhatsApp Chat"
                          className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-emerald-800 dark:text-emerald-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center"
                        >
                          <MessageSquare size={14} />
                        </Button>
                        {["new", "contacted", "follow_up"].includes(l.status) && (
                          <Button
                            onClick={() => setProposeModalLead(l)}
                            title="Propose Admission"
                            className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-teal-800 dark:text-teal-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center"
                          >
                            <Target size={14} />
                          </Button>
                        )}
                        {l.status === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
                          <Button
                            onClick={() => setReviewModalLead(l)}
                            title="Review Proposed Fee"
                            className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-amber-800 dark:text-yellow-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center"
                          >
                            <AlertCircle size={14} />
                          </Button>
                        )}
                        {l.status === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
                          <Button
                            onClick={() => setEnrollModalLead(l)}
                            title="Process Admission"
                            className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-emerald-800 dark:text-emerald-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center"
                          >
                            <CheckCircle2 size={14} />
                          </Button>
                        )}
                        {isSuper(erpUser) && (
                          <Button
                            onClick={() => setDeleteModal(l)}
                            title="Delete Lead"
                            className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-red-800 dark:text-red-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4">
                      {isLoading ? (
                        <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Retrieving prospect pipeline...</div>
                      ) : (
                        <EmptyState title="No leads found" description="There are no leads matching your current criteria." />
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 shrink-0">
            <div>
              Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{items.length}</span> of <span className="font-semibold text-slate-800 dark:text-zinc-200">{totalCount}</span> total leads
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page <= 1 || isLoading}
                className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-2 py-1 text-[11px] font-semibold transition-all duration-300 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="font-mono text-[11px]">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isLoading}
                className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-2 py-1 text-[11px] font-semibold transition-all duration-300 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise CRM Modals */}
      {(selectedLead) && (function(){ const liveLead = items?.find(l => l.id === selectedLead.id) || selectedLead; return <LeadActivityDrawer lead={liveLead} onClose={() => setSelectedLead(null)} onInteractionAdded={(interaction) => { setSelectedLead(prev => ({ ...prev, interactions: [...(prev.interactions || []), interaction] })); }} />; })()}
      {proposeModalLead && <LeadProposeModal academicConfig={academicConfig} lead={proposeModalLead} onClose={() => setProposeModalLead(null)} />}
      {reviewModalLead && <LeadReviewModal lead={reviewModalLead} onClose={() => setReviewModalLead(null)} />}
      {enrollModalLead && <LeadEnrollModal academicConfig={academicConfig} lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}
      {transferModalLead && <LeadTransferModal lead={transferModalLead} branches={branches} onClose={() => setTransferModalLead(null)} />}

      {/* Create Lead Modal */}
      {showCreate && (
        <CreateLeadModal 
          onClose={() => { setShowCreate(false); setSearchParams({}); }} 
          onCreated={() => { setShowCreate(false); setSearchParams({}); reload(); }} 
          defaultBranchId={branchId || erpUser.branch_id}
          branches={branches}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 backdrop-blur-sm transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[16px] max-w-sm w-full p-6 space-y-4 shadow-2xl shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 bg-rose-100 dark:bg-red-500/20 rounded-xl border border-rose-300 dark:border-red-500/20"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="text-[20px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Purge Lead</h3>
                <p className="text-[10px] text-red-800 dark:text-red-300 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to delete lead <strong className="text-slate-800 dark:text-zinc-200">{deleteModal.name}</strong> ({deleteModal.phone})?
            </p>
            <div className="flex gap-2.5 pt-2">
              <Button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await erp.deleteLead(deleteModal.id);
                    toast.success("Lead purged successfully.");
                    queryClient.invalidateQueries();
                    setDeleteModal(null);
                  } catch (err) {
                    toast.error(formatError(err.response?.data?.detail) || "Failed to delete lead");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="flex-1 bg-red-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(220,38,38,0.5),0_4px_16px_rgba(220,38,38,0.25)] hover:bg-red-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
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

// Create Lead Modal Dialog
function CreateLeadModal({ onClose, onCreated, defaultBranchId, branches }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    present_class: "",
    moving_to_class: "",
    address: "",
    remarks: "",
    branch_id: defaultBranchId || (branches[0]?.id || ""),
    counsellor_id: "",
  });
  const [counsellors, setCounsellors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (form.branch_id) {
      erp.listStaff(form.branch_id).then(s => setCounsellors(s.filter(x => x.role === "counsellor"))).catch(() => {});
    }
  }, [form.branch_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.branch_id) {
      toast.error("Please fill in Name, Phone, and Branch");
      return;
    }

    setSubmitting(true);
    try {
      await erp.createLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        present_class: form.present_class.trim() || undefined,
        moving_to_class: form.moving_to_class.trim() || undefined,
        address: form.address.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
        branch_id: form.branch_id,
        counsellor_id: form.counsellor_id || undefined,
      });
      toast.success("Prospect lead added to pipeline");
      onCreated();
    } catch (err) {
      toast.error(formatError(err) || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] w-full max-w-lg rounded-[16px] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Add Prospect Lead</h3>
            <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-0.5">Register new student inquiry into admissions funnel</p>
          </div>
          <Button onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] p-2 transition-all duration-300 w-8 h-8 flex items-center justify-center">
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Saima Mir"
                className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-[10px] py-2 px-3 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit phone #"
                className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-[10px] py-2 px-3 text-[13px] font-mono text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
                Current Class
              </label>
              <input
                type="text"
                value={form.present_class}
                onChange={e => setForm(f => ({ ...f, present_class: e.target.value }))}
                placeholder="e.g. 10th / 11th"
                className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-[10px] py-2 px-3 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
                Target Track / Target Class
              </label>
              <input
                type="text"
                value={form.moving_to_class}
                onChange={e => setForm(f => ({ ...f, moving_to_class: e.target.value }))}
                placeholder="e.g. NEET Repeater / JEE"
                className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-[10px] py-2 px-3 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
              Branch *
            </label>
            <select
              value={form.branch_id}
              onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
              Assigned Counsellor
            </label>
            <select
              value={form.counsellor_id}
              onChange={e => setForm(f => ({ ...f, counsellor_id: e.target.value }))}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
            >
              <option value="">— Select Counsellor —</option>
              {counsellors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
              Address / Town
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="e.g. Rajbagh, Srinagar"
              className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-[10px] py-2 px-3 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">
              Counselling Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={form.remarks}
              onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="e.g. Interested in morning batch; requested scholarship concession"
              className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-[10px] py-2 px-3 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to Pipeline"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}