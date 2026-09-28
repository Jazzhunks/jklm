import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp, STUDENT_CLASSES, STUDENT_COURSES, isSuper, getValidCoursesForClass } from "@/lib/erpApi";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LeadEnrollModal({ lead, onClose, academicConfig }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [matrix, setMatrix] = useState({});
  const [form, setForm] = useState({
    full_name: lead.name || "",
    contact_phone: lead.phone || "",
    current_class: lead.moving_to_class || (academicConfig ? academicConfig.classes[0] : STUDENT_CLASSES[0]),
    course: lead.course || (academicConfig ? academicConfig.courses[0] : STUDENT_COURSES[0]),
    batch: lead.proposed_batch || "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: lead.address || "",
    total_fee: lead.proposed_fee || 0,
    deposit_amount: "",
    payment_mode: "cash",
    payment_reference: ""
  });

  useEffect(() => {
    erp.getFeeMatrix().then(res => setMatrix(res.matrix || {}));
  }, []);

  // If super admin changes class/course, auto update fee. Or if no proposed fee was set yet.
  useEffect(() => {
    if (form.current_class && form.course && matrix[form.current_class]?.[form.course] !== undefined) {
      if (!lead.proposed_fee || isSuper(user)) {
        setForm(prev => ({ ...prev, total_fee: matrix[form.current_class][form.course] }));
      }
    }
  }, [form.current_class, form.course, matrix, lead.proposed_fee, user]);
  
  const enroll = useMutation({
    mutationFn: () => erp.enrollLead(lead.id, { ...form, deposit_amount: Number(form.deposit_amount), total_fee: Number(form.total_fee) }),
    onSuccess: (data) => { toast.success("Admission Processed Successfully!"); queryClient.invalidateQueries(["erpLeads", "erpStudents"]); onClose(); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to process admission")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); enroll.mutate(); }} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-2xl p-6 space-y-4 my-8">
        <div>
          <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Accounts Department</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Finalize Admission</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Student Name *</label>
          <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
          <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Student Phone *</label>
          <input required value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Class *</label>
            <select className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" required value={form.current_class} onChange={e => {
              const newClass = e.target.value;
              const valid = getValidCoursesForClass(newClass);
              const newCourse = valid.includes(form.course) ? form.course : valid[0];
              setForm({...form, current_class: newClass, course: newCourse});
            }} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2">
              {(academicConfig ? academicConfig.classes : STUDENT_CLASSES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Course *</label>
            <select required value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2">
              {(academicConfig ? academicConfig.courses : getValidCoursesForClass(form.current_class)).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Batch</label>
          <input value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Parent Name *</label>
          <input required value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
          <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Parent Phone *</label>
          <input required value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
          <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">Parent Email</label>
          <input type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
        </div>

        <div className="p-3 bg-slate-200/50 dark:bg-white/[0.04]/30 border border-slate-200 dark:border-white/[0.08] rounded-lg space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-white/[0.08]/50 pb-1">Fee & Deposit Verification</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold block mb-1">Approved Total Fee (₹) *</label>
            <input required type="number" readOnly={!isSuper(user)} value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className={`w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 font-black ${!isSuper(user) ? 'opacity-70' : 'text-emerald-600'}`} title={!isSuper(user) ? 'Only Super Admin can manually override the configured matrix fee' : ''} /></div>
            <div><label className="text-xs font-bold block mb-1">Initial Deposit Amount (₹) *</label>
            <input required type="number" min="1" value={form.deposit_amount} onChange={e => setForm({...form, deposit_amount: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 font-bold" placeholder="Amount collected today" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold block mb-1">Payment Mode *</label>
            <select required value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2">
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="pos">Card (POS)</option>
            </select></div>
            <div><label className="text-xs font-bold block mb-1">Ref / Txn ID</label>
            <input value={form.payment_reference} onChange={e => setForm({...form, payment_reference: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" placeholder="Optional" /></div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 w-full">Cancel</Button>
          <Button type="submit" disabled={enroll.isPending} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 w-full">{enroll.isPending ? "Processing..." : "Process Admission & Convert Lead"}</Button>
        </div>
      </form>
    </div>
  );
}
