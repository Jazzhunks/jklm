import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, isManagerPlus, canManageStudents, fmtINR, fmtDate, extractItems, extractTotal, STUDENT_CLASSES, STUDENT_COURSES, getValidCoursesForClass } from "@/lib/erpApi";
import { api, formatError, API_BASE } from "@/lib/api";
import { Search, Plus, Download, GraduationCap, ChevronLeft, ChevronRight, Filter, BookOpen, CheckCircle2, ArrowUpRight, Trash2, AlertTriangle } from "lucide-react";

export default function ErpStudents() {
  const nav = useNavigate();
  const { erpUser, selectedBranchId } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Filters
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(searchParams.get("action") === "new");
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

  const { data: branches = [] } = useQuery({
    queryKey: ['erp-branches'],
    queryFn: () => erp.listBranches(),
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['erp-students', branchId, search, batchFilter, statusFilter, page],
    queryFn: async () => {
      const params = { skip: (page - 1) * limit, limit };
      if (search) params.search = search;
      if (branchId) params.branch_id = branchId;
      if (batchFilter) params.batch = batchFilter;
      if (statusFilter) params.status = statusFilter;
      return erp.listStudents(params);
    },
    keepPreviousData: true,
  });

  const items = extractItems(studentsData);
  const totalCount = extractTotal(studentsData);
  const totalPages = studentsData?.pages || Math.max(Math.ceil(totalCount / limit), 1);

  // Debounced search
  const handleSearch = (e) => {
    const val = e.target.value;
    setQ(val);
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  // Extract unique batches for filter dropdown
  const uniqueBatches = useMemo(() => {
    const set = new Set();
    items.forEach(s => {
      if (s.batch) set.add(s.batch);
    });
    return Array.from(set);
  }, [items]);

  // Quick stats
  const stats = useMemo(() => {
    const scholarshipCount = items.filter(s => Number(s.scholarship_percent || 0) > 0).length;
    const activeCount = items.filter(s => s.status === "active").length;
    return { scholarshipCount, activeCount };
  }, [items]);

  const reload = () => queryClient.invalidateQueries(['erp-students']);

  return (
    <div className="space-y-6 flex flex-col min-h-0 animate-fadeIn bg-slate-50 dark:bg-black" data-testid="erp-students-page">
      {/* Upper Operational Header Card */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Active Academic Roster</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Student Directory</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">
            Centralized student enrollment dossiers, fee plans, and verification profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`${API_BASE}/erp/exports/students.xlsx${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ''}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2" data-testid="export-students-btn">
              <Download size={14}/> Export Excel
            </Button>
          </a>
          {isManagerPlus(erpUser) && (
            <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
              onClick={() => nav("/erp/admission")} 
              className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2" 
              data-testid="create-student-btn"
            >
              <Plus size={14}/> New Admission
            </Button>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Total Enrolled</span>
            <GraduationCap size={14} className="text-teal-600" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] text-slate-900 dark:text-zinc-100 mt-2">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1">
            Registered students in registry
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Active Status</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] text-emerald-800 dark:text-emerald-300 mt-2">
            {stats.activeCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1">
            Attending academic sessions
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Scholarships</span>
            <ArrowUpRight size={14} className="text-yellow-500" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] text-amber-800 dark:text-yellow-300 mt-2">
            {stats.scholarshipCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1">
            Merit fee waivers applied
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">
            <span>Active Batches</span>
            <BookOpen size={14} className="text-blue-500" />
          </div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] text-blue-800 dark:text-blue-300 mt-2">
            {uniqueBatches.length || "—"}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1">
            Assigned classroom cohorts
          </div>
        </div>
      </div>

      {/* Query Filter System */}
      <div className="flex gap-2 flex-wrap items-center justify-between shrink-0">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
          <input type="text"
            value={q} 
            onChange={handleSearch} 
            placeholder="Search by student name, roll #, LUID, or phone..." 
            className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-9 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" 
            data-testid="search-students-input"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {uniqueBatches.length > 0 && (
            <select
              value={batchFilter}
              onChange={e => { setBatchFilter(e.target.value); setPage(1); }}
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
            >
              <option value="">All Batches</option>
              {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

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
            <option value="">Active Roster</option>
            <option value="temporary">Temporary / Leads</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Main Grid View Container */}
      <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] w-full flex flex-col flex-1 min-h-0">
        <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
            <table className="w-full text-sm table-fixed border-collapse min-w-[880px]">
              <thead className="sticky top-0 z-20 bg-white dark:bg-[#111]">
                <tr className="text-left">
                  <th className="w-[14%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Student No</th>
                  <th className="w-[20%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Full Name</th>
                  <th className="w-[15%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Contact</th>
                  <th className="w-[15%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Batch Cohort</th>
                  <th className="w-[12%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-right">Net Fee</th>
                  <th className="w-[12%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left pl-4">Admission</th>
                  <th className="w-[12%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04]">
                {items.map(s => {
                  const baseTuition = Number(s.total_fee || 0);
                  const scholarshipExemption = (Number(s.scholarship_percent || 0) / 100) * baseTuition;
                  const dynamicFlatDiscount = Number(s.discount || 0);
                  const netAmount = Math.max(0, baseTuition - scholarshipExemption - dynamicFlatDiscount);

                  return (
                    <tr key={s.id} className="hover:bg-slate-100 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.04] last:border-0 transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group" data-testid={`student-row-${s.id}`}>
                      <td className="py-3 px-4 text-[13px] text-slate-800 dark:text-zinc-200 font-mono font-medium tracking-wide">
                        {s.student_no}
                        {s.enrollment_number && (
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">Enr: {s.enrollment_number}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[13px] font-medium text-slate-800 dark:text-zinc-200 truncate">
                        <div className="truncate">{s.full_name}</div>
                        {s.status === "temporary" && (
                          <span className="bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.05em] uppercase inline-block mt-1">Lead Match</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[13px] text-slate-600 dark:text-zinc-400 whitespace-nowrap">{s.contact_phone}</td>
                      <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 truncate">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] font-medium font-mono text-zinc-300">
                          {s.batch || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-right font-medium text-teal-800 dark:text-teal-300 whitespace-nowrap text-[13px]">
                        {fmtINR(netAmount)}
                      </td>
                      <td className="py-3 px-4 pl-4 text-[13px] text-slate-600 dark:text-zinc-400 whitespace-nowrap">{fmtDate(s.admission_date)}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            to={`/erp/students/${encodeURIComponent(s.student_no || s.id)}`} 
                            className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-teal-800 dark:text-teal-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center" 
                            title="View Dossier"
                            data-testid={`view-student-${s.student_no || s.id}`}
                          >
                            <ArrowUpRight size={15} />
                          </Link>
                          {isSuper(erpUser) && (
                            <Button
                              onClick={() => setDeleteModal(s)}
                              className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-red-800 dark:text-red-300 hover:bg-slate-200/50 dark:bg-white/[0.04] p-1.5 transition-all duration-300 w-8 h-8 flex items-center justify-center"
                              title="Purge Student Record"
                              data-testid={`delete-student-${s.id}`}
                            >
                              <Trash2 size={15} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8">
                      {isLoading ? (
                        <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Retrieving student records...</div>
                      ) : (
                        <EmptyState title="No students found" description="There are no student records matching your current filters." />
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
              Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{items.length}</span> of <span className="font-semibold text-slate-800 dark:text-zinc-200">{totalCount}</span> total students
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

      {/* Admission Execution Modal */}
      {showCreate && (
        <CreateStudentModal
          erpUser={erpUser}
          branches={branches}
          defaultBranchId={branchId || erpUser.branch_id}
          onClose={() => { setShowCreate(false); setSearchParams({}); }}
          onCreated={() => { setShowCreate(false); setSearchParams({}); reload(); }}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 backdrop-blur-sm transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[16px] max-w-sm w-full p-6 space-y-4 shadow-2xl shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 bg-rose-100 dark:bg-red-500/20 rounded-xl border border-rose-300 dark:border-red-500/20"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="text-[20px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Purge Student</h3>
                <p className="text-[10px] text-red-800 dark:text-red-300 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-zinc-200 font-mono">{deleteModal.full_name} ({deleteModal.student_no})</strong>?
              This will purge all associated financial, enrollment, and attendance records.
            </p>
            <div className="flex gap-2.5 pt-2">
              <Button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await erp.deleteStudent(deleteModal.id);
                    toast.success(`Student ${deleteModal.student_no} deleted successfully.`);
                    queryClient.invalidateQueries();
                    setDeleteModal(null);
                  } catch (err) {
                    toast.error(formatError(err.response?.data?.detail) || "Failed to delete student");
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

