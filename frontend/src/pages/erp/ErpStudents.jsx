import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, fmtINR, fmtDate, extractItems, extractTotal } from "@/lib/erpApi";
import { api, formatError, API_BASE } from "@/lib/api";
import { 
  Search, Plus, Download, X, GraduationCap, Users, User, 
  Mail, Smartphone, ChevronLeft, ChevronRight, Filter, BookOpen, 
  CheckCircle2, AlertCircle, ArrowUpRight, Trash2, AlertTriangle
} from "lucide-react";

export default function ErpStudents() {
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
    <div className="space-y-6 flex flex-col min-h-0 animate-fadeIn" data-testid="erp-students-page">
      {/* Upper Operational Header Card */}
      <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Active Academic Roster</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight mt-1">Student Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Centralized student enrollment dossiers, fee plans, and verification profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`${API_BASE}/erp/exports/students.xlsx${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ''}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <button className="px-3.5 py-2 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2 transition" data-testid="export-students-btn">
              <Download size={14}/> Export Excel
            </button>
          </a>
          {erpUser.role !== "counsellor" && (
            <button 
              onClick={() => setShowCreate(true)} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-primary/90 shadow-md transition" 
              data-testid="create-student-btn"
            >
              <Plus size={14}/> New Admission
            </button>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Total Enrolled</span>
            <GraduationCap size={14} className="text-primary" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground font-mono">
            {totalCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Registered students in registry
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Active Status</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-emerald-600 font-mono">
            {stats.activeCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Attending academic sessions
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Scholarships</span>
            <ArrowUpRight size={14} className="text-amber-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground font-mono">
            {stats.scholarshipCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Merit fee waivers applied
          </div>
        </div>

        <div className="glass-elevated p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Active Batches</span>
            <BookOpen size={14} className="text-sky-500" />
          </div>
          <div className="font-display text-2xl font-semibold mt-2 text-foreground font-mono">
            {uniqueBatches.length || "—"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Assigned classroom cohorts
          </div>
        </div>
      </div>

      {/* Query Filter System */}
      <div className="flex gap-2 flex-wrap items-center justify-between shrink-0">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input 
            type="text"
            value={q} 
            onChange={handleSearch} 
            placeholder="Search by student name, roll #, LUID, or phone..." 
            className="w-full pl-9 pr-4 py-2 border border-border bg-card rounded-xl text-xs focus:outline-none focus:border-primary transition text-foreground" 
            data-testid="search-students-input"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {uniqueBatches.length > 0 && (
            <select
              value={batchFilter}
              onChange={e => { setBatchFilter(e.target.value); setPage(1); }}
              className="border border-border rounded-xl px-3 py-1.5 bg-card text-xs focus:outline-none text-foreground"
            >
              <option value="">All Batches</option>
              {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

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

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-xl px-3 py-1.5 bg-card text-xs focus:outline-none text-foreground"
          >
            <option value="">Active Roster</option>
            <option value="temporary">Temporary / Leads</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Main Grid View Container */}
      <div className="glass-elevated rounded-2xl border border-border w-full overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
          <table className="w-full text-sm table-fixed border-collapse min-w-[880px]">
            <thead className="bg-muted text-muted-foreground sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <tr className="text-left backdrop-blur-md">
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Student No</th>
                <th className="w-[20%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Full Name</th>
                <th className="w-[15%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Contact</th>
                <th className="w-[15%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Batch Cohort</th>
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-muted">Net Fee</th>
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Admission</th>
                <th className="w-[12%] bg-muted text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background/20">
              {items.map(s => {
                const baseTuition = Number(s.total_fee || 0);
                const scholarshipExemption = (Number(s.scholarship_percent || 0) / 100) * baseTuition;
                const dynamicFlatDiscount = Number(s.discount || 0);
                const netAmount = Math.max(0, baseTuition - scholarshipExemption - dynamicFlatDiscount);

                return (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors group" data-testid={`student-row-${s.id}`}>
                    <td className="px-5 py-3.5 font-mono text-xs text-foreground font-semibold tracking-wide">
                      {s.student_no}
                      {s.enrollment_number && (
                        <div className="text-[10px] text-muted-foreground font-mono">Enr: {s.enrollment_number}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-foreground truncate">
                      <div className="truncate">{s.full_name}</div>
                      {s.status === "temporary" && (
                        <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1 rounded">Lead Match</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{s.contact_phone}</td>
                    <td className="px-5 py-3.5 text-xs text-foreground truncate">
                      <span className="px-2 py-0.5 rounded bg-muted/60 border border-border text-[11px] font-medium font-mono">
                        {s.batch || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-right font-bold text-sky-500 whitespace-nowrap text-sm">
                      {fmtINR(netAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(s.admission_date)}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          to={`/erp/students/${encodeURIComponent(s.student_no || s.id)}`} 
                          className="inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-lg transition" 
                          data-testid={`view-student-${s.student_no || s.id}`}
                        >
                          Dossier →
                        </Link>
                        {isSuper(erpUser) && (
                          <button
                            onClick={() => setDeleteModal(s)}
                            className="p-1 hover:bg-rose-500/10 text-rose-500 border border-transparent hover:border-rose-500/20 rounded-lg transition"
                            title="Purge Student Record"
                            data-testid={`delete-student-${s.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-muted-foreground italic text-sm">
                    {isLoading ? "Retrieving student records..." : "No student profiles found matching your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div>
            Showing <span className="font-semibold text-foreground">{items.length}</span> of <span className="font-semibold text-foreground">{totalCount}</span> total students
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
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="font-display font-medium text-lg text-foreground">Purge Student</h3>
                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-foreground font-mono">{deleteModal.full_name} ({deleteModal.student_no})</strong>?
              This will purge all associated financial, enrollment, and attendance records.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
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

// Admission Modal
function CreateStudentModal({ erpUser, branches, defaultBranchId, onClose, onCreated }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    address: "",
    contact_phone: "",
    contact_email: "",
    emergency_phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    current_class: "",
    school_institute: "",
    board: "CBSE",
    category: "General",
    course_id: "",
    batch: "",
    batch_timing: "Morning",
    course_duration: "1 Year",
    branch_id: defaultBranchId || (branches[0]?.id || ""),
    admission_date: new Date().toISOString().split("T")[0],
    total_fee: "",
    scholarship_percent: 0,
    discount: 0,
    additional_discount_by: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredCourses = courses.filter(c => ["Foundation", "NEET", "IIT-JEE"].includes(c.category));

  const computeFinalFee = () => {
    const total = parseFloat(form.total_fee) || 0;
    const scholarship = parseFloat(form.scholarship_percent) || 0;
    const discount = parseFloat(form.discount) || 0;
    const scholarshipAmt = total * (scholarship / 100);
    return Math.max(total - scholarshipAmt - discount, 0);
  };

  const finalFee = computeFinalFee();

  useEffect(() => {
    api.get("/courses").then(r => setCourses(Array.isArray(r.data) ? r.data : (r.data?.items || []))).catch(() => setCourses([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!form.full_name.trim() || !form.contact_phone.trim() || !form.branch_id || !form.course_id || !form.dob || !form.gender || !form.address || !form.current_class || !form.total_fee) {
      toast.error("Please fill in all required fields");
      return;
    }
    if ((parseFloat(form.discount) || 0) > 0 && !form.additional_discount_by.trim()) {
      toast.error("Please mention who authorized the additional discount");
      return;
    }

    setBusy(true);
    try {
      const selectedCourse = courses.find(c => c.id === form.course_id);
      const payload = {
        full_name: form.full_name.trim(),
        gender: form.gender,
        dob: form.dob,
        address: form.address.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || undefined,
        emergency_phone: form.emergency_phone?.trim() || undefined,
        parent_name: form.parent_name.trim() || undefined,
        parent_phone: form.parent_phone.trim() || undefined,
        parent_email: form.parent_email.trim() || undefined,
        current_class: form.current_class.trim(),
        school_institute: form.school_institute?.trim() || undefined,
        board: form.board || undefined,
        category: form.category || undefined,
        course_id: form.course_id,
        batch: form.batch.trim() || undefined,
        batch_timing: form.batch_timing.trim() || undefined,
        course_duration: form.course_duration.trim() || undefined,
        branch_id: form.branch_id,
        admission_date: form.admission_date || undefined,
        total_fee: parseFloat(form.total_fee) || (selectedCourse?.fee || 0),
        scholarship_percent: parseFloat(form.scholarship_percent) || 0,
        discount: parseFloat(form.discount) || 0,
        additional_discount_by: form.additional_discount_by.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      await erp.createStudent(payload);
      toast.success(`Admission recorded successfully: ${form.full_name}`);
      onCreated();
    } catch (err) {
      toast.error(formatError(err) || "Failed to record admission");
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none focus:border-primary";
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">New Admission</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Record a new learner admission</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Registered Name *</label>
              <input type="text" required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Learner full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender *</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inputCls}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <input type="date" required value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Regd. Mobile Number *</label>
              <input type="tel" required value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="10-digit mobile number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Regd. Email ID *</label>
              <input type="email" required value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="name@example.com" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Residential Address *</label>
            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full residential address" rows={2} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Current Class *</label>
              <select required value={form.current_class} onChange={e => setForm(f => ({ ...f, current_class: e.target.value }))} className={inputCls}>
                <option value="">Select Class</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="Droppers">Droppers</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Board</label>
              <select value={form.board} onChange={e => setForm(f => ({ ...f, board: e.target.value }))} className={inputCls}>
                <option value="CBSE">CBSE</option>
                <option value="State Board">State Board</option>
                <option value="ICSE">ICSE</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>Previous School / Institute</label>
              <input type="text" value={form.school_institute} onChange={e => setForm(f => ({ ...f, school_institute: e.target.value }))} placeholder="Name of previous school or institute" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Admission Date *</label>
              <input type="date" required value={form.admission_date} onChange={e => setForm(f => ({ ...f, admission_date: e.target.value }))} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Course *</label>
              <select required value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} className={inputCls}>
                <option value="">Select Course</option>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Branch *</label>
              <select required value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))} className={inputCls}>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Batch Name</label>
              <input type="text" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="e.g. NEET-2026-B1" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Morning / Afternoon / Evening</label>
              <select value={form.batch_timing} onChange={e => setForm(f => ({ ...f, batch_timing: e.target.value }))} className={inputCls}>
                <option value="">Select Timing</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Course Duration</label>
              <input type="text" value={form.course_duration} onChange={e => setForm(f => ({ ...f, course_duration: e.target.value }))} placeholder="e.g. 1 Year" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Parent / Guardian Name *</label>
              <input type="text" required value={form.parent_name} onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))} placeholder="Father or guardian full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Parent Mobile Number *</label>
              <input type="tel" required value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} placeholder="Primary parent mobile" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Emergency / Alt Number</label>
              <input type="tel" value={form.emergency_phone} onChange={e => setForm(f => ({ ...f, emergency_phone: e.target.value }))} placeholder="Alternative contact" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Parent Email Address</label>
              <input type="email" value={form.parent_email} onChange={e => setForm(f => ({ ...f, parent_email: e.target.value }))} placeholder="parent@example.com" className={inputCls} />
            </div>
          </div>

          <div className="p-3 bg-muted/20 rounded-xl border border-border space-y-3">
            <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Fee Architecture</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Total Course Fee (INR) *</label>
                <input type="number" required value={form.total_fee} onChange={e => setForm(f => ({ ...f, total_fee: e.target.value }))} placeholder="₹ 0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Scholarship %</label>
                <input type="number" min="0" max="100" value={form.scholarship_percent} onChange={e => setForm(f => ({ ...f, scholarship_percent: e.target.value }))} placeholder="0 - 100" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Additional Discount (INR)</label>
                <input type="number" min="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="₹ 0" className={inputCls} />
              </div>
            </div>
            {((parseFloat(form.discount) || 0) > 0) && (
              <div>
                <label className={labelCls}>Additional Discount By *</label>
                <input type="text" value={form.additional_discount_by} onChange={e => setForm(f => ({ ...f, additional_discount_by: e.target.value }))} placeholder="Name of authorizing person" className={inputCls} />
                {submitted && !form.additional_discount_by.trim() && <p className="text-[10px] text-rose-500 mt-1">Required when additional discount is applied</p>}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Computed Net Fee</span>
              <span className="font-mono font-bold text-lg text-accent">₹ {finalFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>Feedback / Questions</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any feedback or questions..." rows={2} className={inputCls} />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 shadow-md transition disabled:opacity-50">
              {busy ? "Recording..." : "Submit Admission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}