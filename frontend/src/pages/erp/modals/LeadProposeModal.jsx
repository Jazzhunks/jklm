import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp, STUDENT_CLASSES, STUDENT_COURSES, getValidCoursesForClass } from "@/lib/erpApi";
import { useEffect } from "react";

export default function LeadProposeModal({ lead, onClose, academicConfig }) {
  const queryClient = useQueryClient();
  const [matrix, setMatrix] = useState({});
  const [form, setForm] = useState({ proposed_fee: "", moving_to_class: lead.moving_to_class || (academicConfig ? academicConfig.classes[0] : STUDENT_CLASSES[0]), course: (academicConfig ? academicConfig.courses[0] : STUDENT_COURSES[0]), batch_name: "", notes: "" });

  useEffect(() => {
    erp.getFeeMatrix().then(res => setMatrix(res.matrix || {}));
  }, []);

  useEffect(() => {
    if (form.moving_to_class && form.course && matrix[form.moving_to_class]?.[form.course] !== undefined) {
      setForm(prev => ({ ...prev, proposed_fee: matrix[form.moving_to_class][form.course] }));
    }
  }, [form.moving_to_class, form.course, matrix]);
  
  const propose = useMutation({
    mutationFn: () => erp.proposeLead(lead.id, { ...form, proposed_fee: Number(form.proposed_fee) }),
    onSuccess: () => {
      toast.success("Fee proposed successfully");
      queryClient.invalidateQueries(["erpLeads"]);
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.detail || "Failed to propose fee")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); propose.mutate(); }} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-sm p-5 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Propose Admission</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Propose a final fee and target class. This will go to a Manager for approval.</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Target Class *</label>
            <select className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" required value={form.moving_to_class} onChange={e => {
              const newClass = e.target.value;
              const valid = getValidCoursesForClass(newClass);
              const newCourse = valid.includes(form.course) ? form.course : valid[0];
              setForm({...form, moving_to_class: newClass, course: newCourse});
            }} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2">
              {(academicConfig ? academicConfig.classes : STUDENT_CLASSES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Course *</label>
            <select required value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2">
              {(academicConfig ? academicConfig.courses : getValidCoursesForClass(form.moving_to_class)).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Proposed Total Fee (₹) *</label>
        <input required type="number" min="0" value={form.proposed_fee} onChange={e => setForm({...form, proposed_fee: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 font-bold text-emerald-600" /></div>
        
        <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Batch (Optional)</label>
        <input value={form.batch_name} onChange={e => setForm({...form, batch_name: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" /></div>
        
        <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Notes / Reason for concession</label>
        <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 min-h-[60px]" /></div>
        
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 w-full">Cancel</Button>
          <Button type="submit" disabled={propose.isPending} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 w-full">{propose.isPending ? "Submitting..." : "Submit Proposal"}</Button>
        </div>
      </form>
    </div>
  );
}
