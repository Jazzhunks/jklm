import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { erp, isSuper, STUDENT_CLASSES, STUDENT_COURSES, getValidCoursesForClass } from "@/lib/erpApi";
import { toast } from "sonner";
import { GraduationCap, ArrowLeft, Loader2, Save } from "lucide-react";

export default function ErpAdmission() {
  const nav = useNavigate();
  const { erpUser, academicConfig } = useOutletContext();
  const [initialized, setInitialized] = useState(false);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "", gender: "male", dob: "", address: "",
    contact_phone: "", contact_email: "", parent_name: "", parent_phone: "", parent_email: "",
    current_class: "", course_id: "", batch: "", batch_timing: "", course_duration: "",
    branch_id: "", total_fee: "", scholarship_percent: "0", discount: "0", additional_discount_by: "", notes: ""
  });

  useEffect(() => {
    if (erpUser && !initialized) {
      setForm(prev => ({ ...prev, branch_id: erpUser.branch_id || "" }));
      setInitialized(true);
    }
  }, [erpUser, initialized]);

  useEffect(() => {
    const load = async () => {
      try {
        if (isSuper(erpUser)) {
          const bd = await erp.listBranches();
          setBranches(bd);
        }
        const md = await erp.getFeeMatrix();
        
      } catch (e) {
        console.error("Failed to load admission dependencies", e);
      }
    };
    if (erpUser) load();
  }, [erpUser]);

  useEffect(() => {
    if (form.current_class && form.course_id && ((academicConfig.matrix && academicConfig.matrix.matrix) ? academicConfig.matrix.matrix : academicConfig.matrix)[form.current_class] && ((academicConfig.matrix && academicConfig.matrix.matrix) ? academicConfig.matrix.matrix : academicConfig.matrix)[form.current_class][form.course_id]) {
      setForm(prev => ({ ...prev, total_fee: ((academicConfig.matrix && academicConfig.matrix.matrix) ? academicConfig.matrix.matrix : academicConfig.matrix)[form.current_class][form.course_id] }));
    }
  }, [form.current_class, form.course_id, academicConfig.matrix]);

  const executeSubmit = async (e) => {
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
      
      const payload = {
        full_name: form.full_name.trim(),
        gender: form.gender,
        dob: form.dob,
        address: form.address.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || undefined,
        parent_name: form.parent_name.trim() || undefined,
        parent_phone: form.parent_phone.trim() || undefined,
        parent_email: form.parent_email.trim() || undefined,
        current_class: form.current_class.trim(),
        course_id: form.course_id,
        batch: form.batch.trim() || undefined,
        batch_timing: form.batch_timing.trim() || undefined,
        course_duration: form.course_duration.trim() || undefined,
        branch_id: form.branch_id,
        total_fee: parseFloat(form.total_fee) || 0,
        scholarship_percent: parseFloat(form.scholarship_percent) || 0,
        discount: parseFloat(form.discount) || 0,
        additional_discount_by: form.additional_discount_by.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      await erp.createStudent(payload);
      toast.success("New student academic enrollment committed successfully");
      nav("/erp/students");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to commit parameters");
    } finally { setBusy(false); }
  };

  const inputCls = "w-full px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/50 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 transition-all text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:text-zinc-500 font-mono";
  const labelCls = "text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500 dark:text-zinc-400 mb-1.5 block ml-1";

  console.log("ERP USER:", erpUser); if (!erpUser) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#080808] p-6 lg:p-8 animate-fadeIn overflow-y-auto min-h-0">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <Button onClick={() => nav(-1)} className="bg-transparent border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 rounded-full w-10 h-10 flex items-center justify-center p-0 transition-all duration-300">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-100 dark:bg-teal-600/10 text-teal-800 dark:text-teal-400 border border-teal-300 dark:border-teal-600/25 mb-1.5">
            Admissions Flow
          </div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100 flex items-center gap-3">
            <GraduationCap className="text-teal-600 shrink-0" size={32} /> New Student Enrollment
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-[1.75rem] overflow-hidden flex-1 flex flex-col">
        <form onSubmit={executeSubmit} className="flex-1 flex flex-col min-h-0 p-6 lg:p-10 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Core Identity */}
            <div className="space-y-5 lg:col-span-3">
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-white/[0.04] pb-2">Core Identity Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Full Legal Name *</label>
                  <input type="text" className={inputCls} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input type="date" className={inputCls} value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Contact Coordinates */}
            <div className="space-y-5 lg:col-span-3 mt-4">
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-white/[0.04] pb-2">Contact & Family Coordinates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className={labelCls}>Student Phone *</label><input type="text" className={inputCls} value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
                <div><label className={labelCls}>Student Email</label><input type="email" className={inputCls} value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
                <div><label className={labelCls}>Parent/Guardian Name</label><input type="text" className={inputCls} value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} /></div>
                <div><label className={labelCls}>Parent Phone</label><input type="text" className={inputCls} value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Residential Address *</label><textarea className={`${inputCls} min-h-[60px]`} value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              </div>
            </div>

            {/* Academic Vector */}
            <div className="space-y-5 lg:col-span-3 mt-4">
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-white/[0.04] pb-2">Academic Enrollment Vector</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {isSuper(erpUser) && (
                  <div>
                    <label className={labelCls}>Execution Branch *</label>
                    <select className={inputCls} value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})}>
                      <option value="">-- Select --</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelCls}>Target Class *</label>
                  <select className={inputCls} value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})}>
                    <option value="">-- Select --</option>
                    {academicConfig.classes.map(c => <option key={c} value={c}>{c}</option>)}
                    
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Course Matrix *</label>
                  <select className={inputCls} value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
                    <option value="">-- Select --</option>
                    {academicConfig.courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Batch Identifier</label><input type="text" className={inputCls} placeholder="e.g. Zenith-1" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} /></div>
              </div>
            </div>

            {/* Financial Ledger Setup */}
            <div className="space-y-5 lg:col-span-3 mt-4">
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-white/[0.04] pb-2">Financial Ledger Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div><label className={labelCls}>Base Total Fee (INR) *</label><input type="number" className={inputCls} value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} /></div>
                <div><label className={labelCls}>Scholarship Protocol (%)</label><input type="number" className={inputCls} value={form.scholarship_percent} onChange={e => setForm({...form, scholarship_percent: e.target.value})} /></div>
                <div><label className={labelCls}>Flat Discount Overwrite</label><input type="number" className={inputCls} value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} /></div>
                {(parseFloat(form.discount) || 0) > 0 && (
                  <div className="md:col-span-3">
                    <label className={labelCls}>Authorization (Required for Overwrites)</label>
                    <input type="text" className={inputCls} placeholder="Authorized By Name/Role" value={form.additional_discount_by} onChange={e => setForm({...form, additional_discount_by: e.target.value})} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Operational Notes */}
            <div className="space-y-5 lg:col-span-3 mt-4">
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-white/[0.04] pb-2">Operational Notes</h3>
              <div><textarea className={`${inputCls} min-h-[60px]`} placeholder="Any specific requirements or context..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
          </div>

        </form>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-black/20 flex items-center justify-end gap-3 shrink-0">
          <Button disabled={busy} onClick={() => nav(-1)} className="bg-transparent border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 rounded-full px-6 py-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300">
            Discard
          </Button>
          <Button disabled={busy} onClick={executeSubmit} className="bg-teal-600 text-white rounded-full px-8 py-2.5 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center justify-center gap-2">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {busy ? "Committing..." : "Commit Enrollment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
