import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import LeadActivityDrawer from "@/pages/erp/modals/LeadActivityDrawer";
import LeadProposeModal from "@/pages/erp/modals/LeadProposeModal";
import LeadReviewModal from "@/pages/erp/modals/LeadReviewModal";
import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";
import LeadTransferModal from "@/pages/erp/modals/LeadTransferModal";
import { Replace } from "lucide-react";
import { isFinance } from "@/lib/erpApi";
import { erp, isSuper, isManagerPlus, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { formatError, api } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { TrendingUp, Users, Target, Activity } from "lucide-react";
import { 
  Plus, X, Search, Smartphone, Edit3, MessageSquare, Calendar, 
  Milestone, LayoutGrid, List, ChevronLeft, ChevronRight, 
  ArrowRight, CheckCircle2, UserCheck, AlertCircle, Clock,
  Trash2, AlertTriangle
} from "lucide-react";

const STAGES = [
  { id: "new", label: "New Leads", color: "sky", style: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  { id: "contacted", label: "Contacted", color: "indigo", style: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  { id: "follow_up", label: "Follow-Up", color: "amber", style: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  { id: "pending_approval", label: "Pending Approval", color: "fuchsia", style: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400" },
  { id: "approved_for_accounts", label: "Accounts Handoff", color: "orange", style: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
  { id: "converted", label: "Converted", color: "emerald", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" },
  { id: "lost", label: "Closed / Lost", color: "rose", style: "border-rose-500/30 bg-rose-500/10 text-rose-500" },
];

export default function ErpLeads() {
  const { erpUser, selectedBranchId } = useOutletContext();
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
  const limit = viewMode === "kanban" ? 100 : 25;

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
    <div className="space-y-6 flex flex-col min-h-0 animate-fadeIn" data-testid="erp-leads-page">
      {/* Header Deck */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Admissions CRM &amp; Pipeline</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight mt-1">Prospect Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Lead stage progression, counsellor follow-ups, and automated student conversions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-muted/40 border border-border rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "kanban" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Data Table View"
            >
              <List size={15} />
            </button>
          </div>

          <button 
            onClick={() => setShowCreate(true)} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-primary/90 shadow-md transition" 
            data-testid="create-lead-btn"
          >
            <Plus size={14}/> Add Prospect
          </button>
        </div>
      </div>

      
      {/* $10B Enterprise CRM Dashboard - Analytical View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        
        {/* Metric 1 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Users size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Pipeline Leads</h3>
          <div className="text-3xl font-black text-foreground font-display">{items?.length || 0}</div>
          <div className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-2 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full"><TrendingUp size={12}/> High Volume</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Target size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Win Rate</h3>
          <div className="text-3xl font-black text-emerald-600 font-display">
            {items?.length ? Math.round(((stageBuckets["converted"]?.length || 0) / items.length) * 100) : 0}%
          </div>
          <div className="text-[10px] font-semibold text-sky-500 flex items-center gap-1 mt-2 bg-sky-500/10 w-fit px-2 py-0.5 rounded-full"><Activity size={12}/> {stageBuckets["converted"]?.length || 0} Enrolled</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-amber-500/5 border border-amber-500/30 shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-amber-500"><AlertCircle size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Follow-ups Due Today</h3>
          <div className="text-3xl font-black text-amber-500 font-display">
            {stageBuckets["follow_up"]?.filter(l => l.next_followup_at && new Date(l.next_followup_at).toDateString() === new Date().toDateString()).length || 0}
          </div>
          <div className="text-[10px] font-semibold text-amber-500 flex items-center gap-1 mt-2 bg-amber-500/20 w-fit px-2 py-0.5 rounded-full">Requires Immediate Action</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><TrendingUp size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pipeline Potential</h3>
          <div className="text-3xl font-black text-indigo-500 font-display">
            ₹{((stageBuckets["pending_approval"]?.reduce((sum, l) => sum + (Number(l.proposed_fee) || 0), 0) || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] font-semibold text-indigo-500 flex items-center gap-1 mt-2 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full">Based on Pending Approval</div>
        </div>
      </div>
      
      {/* Visual Pipeline Funnel (Simplified) */}
      <div className="bg-card border border-border shadow-sm rounded-2xl p-4 flex items-center gap-1 overflow-x-auto shrink-0">
        {STAGES.map((s, idx) => {
          const count = stageBuckets[s.id]?.length || 0;
          const total = items?.length || 1;
          const percent = Math.max(8, Math.round((count / total) * 100));
          return (
            <div key={s.id} className={`h-12 flex items-center justify-between px-3 rounded-xl ${s.style} border min-w-[120px] transition-all`} style={{ flexBasis: `${percent}%`, flexGrow: 1 }}>
              <div className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.label}</div>
              <div className="text-lg font-black">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex gap-2 flex-wrap items-center justify-between shrink-0">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input 
            type="text"
            value={q} 
            onChange={handleSearchChange} 
            placeholder="Search prospect by name, phone, class, or remarks..." 
            className="w-full pl-9 pr-3 py-1.5 border border-border bg-card rounded-xl text-xs focus:outline-none focus:border-primary transition text-foreground"
            data-testid="search-leads-input"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
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

          {viewMode === "table" && (
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-border rounded-xl px-3 py-1.5 bg-card text-xs focus:outline-none text-foreground"
            >
              <option value="all">All Stages</option>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "kanban" ? (
        /* Kanban Pipeline Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto flex-1 min-h-0 pb-4 custom-scrollbar">
          {STAGES.map(stage => {
            const stageLeads = stageBuckets[stage.id] || [];
            return (
              <div 
                key={stage.id} 
                className="bg-muted/20 border border-border rounded-2xl p-3 flex flex-col min-h-[500px] max-h-full"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3 shrink-0">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${stage.style}`}>
                    {stage.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Deck */}
                <div className="space-y-2.5 overflow-y-auto flex-1 custom-scrollbar pr-1">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="glass-elevated p-3.5 rounded-xl border border-border hover:border-primary/40 cursor-pointer transition group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground truncate">{lead.name}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setTransferModalLead(lead); }}
                            title="Transfer Branch"
                            className="text-muted-foreground hover:text-indigo-500 transition"
                          >
                            <Replace size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(lead); }}
                            title="Open WhatsApp Chat"
                            className="text-muted-foreground hover:text-emerald-500 transition"
                          >
                            <MessageSquare size={13} />
                          </button>
                          {isSuper(erpUser) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteModal(lead); }}
                              title="Delete Lead"
                              className="text-muted-foreground hover:text-rose-500 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground mt-1">
                        <Smartphone size={11} className="shrink-0" />
                        <span>{lead.phone}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {lead.temperature === "hot" && <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[10px] font-bold">🔥 Hot</span>}
                        {lead.temperature === "warm" && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-bold">☀️ Warm</span>}
                        {lead.temperature === "cold" && <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded text-[10px] font-bold">❄️ Cold</span>}
                        
                        {lead.source && (
                          <span className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {lead.source}
                          </span>
                        )}

                        {lead.moving_to_class && (
                          <span className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-[10px] font-medium text-accent">
                            {lead.moving_to_class}
                          </span>
                        )}
                      </div>

                      {lead.remarks && (
                        <p className="mt-2 text-[11px] text-muted-foreground italic line-clamp-2">
                          "{lead.remarks}"
                        </p>
                      )}

                      {/* Stage Progression Quick Action */}
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{fmtDate(lead.created_at)}</span>
                        
                        {["new", "contacted"].includes(stage.id) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStage(lead.id, stage.id === "new" ? "contacted" : "follow_up"); }}
                            className="text-primary hover:underline font-bold flex items-center gap-0.5"
                          >
                            {stage.id === "new" ? "Contacted" : "Follow Up"} →
                          </button>
                        )}
                        {["contacted", "follow_up"].includes(stage.id) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setProposeModalLead(lead); }}
                            className="text-fuchsia-500 hover:underline font-bold flex items-center gap-0.5 border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-0.5 rounded"
                          >
                            Propose Fee →
                          </button>
                        )}
                        {stage.id === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewModalLead(lead); }}
                            className="text-orange-500 hover:underline font-bold flex items-center gap-0.5 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded"
                          >
                            Review Fee →
                          </button>
                        )}
                        {stage.id === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEnrollModalLead(lead); }}
                            className="text-emerald-600 hover:underline font-bold flex items-center gap-0.5 border border-emerald-600/20 bg-emerald-600/10 px-2 py-0.5 rounded"
                          >
                            Process Admission →
                          </button>
                        )}
                        {stage.id === "converted" && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Enrolled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-12 text-center text-xs text-muted-foreground/60 italic">
                      No prospects in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="glass-elevated rounded-2xl border border-border w-full overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
            <table className="w-full text-sm table-fixed border-collapse min-w-[880px]">
              <thead className="bg-muted text-muted-foreground sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                <tr className="text-left backdrop-blur-md">
                  <th className="w-[18%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Lead Name</th>
                  <th className="w-[15%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Phone</th>
                  <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Class Target</th>
                  <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Stage</th>
                  <th className="w-[25%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Remarks</th>
                  <th className="w-[14%] px-5 py-3.5 bg-muted text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background/20">
                {items.map(l => (
                  <tr key={l.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-5 py-3.5 text-xs font-bold text-foreground truncate">{l.name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{l.phone}</td>
                    <td className="px-5 py-3.5 text-xs text-foreground truncate">{l.moving_to_class || l.present_class || "—"}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        STAGES.find(s => s.id === l.status)?.style || "border-border bg-muted/50 text-muted-foreground"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground truncate" title={l.remarks}>{l.remarks || "—"}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openWhatsApp(l)}
                          title="WhatsApp Chat"
                          className="p-1.5 text-muted-foreground hover:text-emerald-500 rounded-lg transition"
                        >
                          <MessageSquare size={14} />
                        </button>
                        {["new", "contacted", "follow_up"].includes(l.status) && (
                          <button
                            onClick={() => setProposeModalLead(l)}
                            title="Propose Admission"
                            className="p-1 text-muted-foreground hover:text-fuchsia-500 hover:bg-fuchsia-500/10 rounded transition"
                          >
                            <Target size={14} />
                          </button>
                        )}
                        {l.status === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
                          <button
                            onClick={() => setReviewModalLead(l)}
                            title="Review Proposed Fee"
                            className="p-1 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded transition"
                          >
                            <AlertCircle size={14} />
                          </button>
                        )}
                        {l.status === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
                          <button
                            onClick={() => setEnrollModalLead(l)}
                            title="Process Admission"
                            className="p-1 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10 rounded transition"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {isSuper(erpUser) && (
                          <button
                            onClick={() => setDeleteModal(l)}
                            title="Delete Lead"
                            className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center text-muted-foreground italic text-sm">
                      {isLoading ? "Retrieving prospect pipeline..." : "No leads located matching criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <div>
              Showing <span className="font-semibold text-foreground">{items.length}</span> of <span className="font-semibold text-foreground">{totalCount}</span> total leads
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
      )}

      

      {/* Enterprise CRM Modals */}
      {selectedLead && <LeadActivityDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      {proposeModalLead && <LeadProposeModal lead={proposeModalLead} onClose={() => setProposeModalLead(null)} />}
      {reviewModalLead && <LeadReviewModal lead={reviewModalLead} onClose={() => setReviewModalLead(null)} />}
      {enrollModalLead && <LeadEnrollModal lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}
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
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="font-display font-medium text-lg text-foreground">Purge Lead</h3>
                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete lead <strong className="text-foreground">{deleteModal.name}</strong> ({deleteModal.phone})?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Add Prospect Lead</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Register new student inquiry into admissions funnel</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Saima Mir"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit phone #"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Current Class
              </label>
              <input
                type="text"
                value={form.present_class}
                onChange={e => setForm(f => ({ ...f, present_class: e.target.value }))}
                placeholder="e.g. 10th / 11th"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Target Track / Target Class
              </label>
              <input
                type="text"
                value={form.moving_to_class}
                onChange={e => setForm(f => ({ ...f, moving_to_class: e.target.value }))}
                placeholder="e.g. NEET Repeater / JEE"
                className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Branch *
            </label>
            <select
              value={form.branch_id}
              onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-semibold text-foreground focus:outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Assigned Counsellor
            </label>
            <select
              value={form.counsellor_id}
              onChange={e => setForm(f => ({ ...f, counsellor_id: e.target.value }))}
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="">— Select Counsellor —</option>
              {counsellors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Address / Town
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="e.g. Rajbagh, Srinagar"
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Counselling Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={form.remarks}
              onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="e.g. Interested in morning batch; requested scholarship concession"
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none resize-none"
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
              {submitting ? "Adding..." : "Add to Pipeline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}