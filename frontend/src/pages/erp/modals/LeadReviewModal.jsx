import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";

export default function LeadReviewModal({ lead, onClose }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  
  const approve = useMutation({
    mutationFn: () => erp.approveLead(lead.id, { notes }),
    onSuccess: () => { toast.success("Fee approved. Handed off to accounts."); queryClient.invalidateQueries(["erpLeads"]); onClose(); },
    onError: (err) => toast.error("Failed to approve")
  });

  const reject = useMutation({
    mutationFn: () => erp.rejectLead(lead.id, { notes }),
    onSuccess: () => { toast.success("Fee rejected. Returned to counselor."); queryClient.invalidateQueries(["erpLeads"]); onClose(); },
    onError: (err) => toast.error("Failed to reject")
  });

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-sm p-5 space-y-4">
        <h3 className="font-bold text-lg">Review Proposed Fee</h3>
        
        <div className="bg-slate-200/50 dark:bg-white/[0.04]/30 p-3 rounded-lg border border-slate-200 dark:border-white/[0.08]/50 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Prospect:</span> <span className="font-bold">{lead.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Target Class:</span> <span className="font-bold">{lead.moving_to_class}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Batch:</span> <span className="font-bold">{lead.proposed_batch || "-"}</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/[0.08]/50"><span className="text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px]">Proposed Fee:</span> <span className="font-black text-emerald-500">₹{lead.proposed_fee}</span></div>
        </div>

        <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Approval / Rejection Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 min-h-[60px]" placeholder="Add remarks for the counselor or accounts..." /></div>
        
        <div className="flex gap-2 justify-end pt-2">
          <Button onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300">Cancel</Button>
          <Button onClick={() => reject.mutate()} disabled={reject.isPending || approve.isPending} className="px-3 py-1.5 text-sm bg-rose-500/10 text-rose-500 font-bold rounded hover:bg-rose-500/20">{reject.isPending ? "..." : "Reject"}</Button>
          <Button onClick={() => approve.mutate()} disabled={reject.isPending || approve.isPending} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300">{approve.isPending ? "..." : "Approve Fee"}</Button>
        </div>
      </div>
    </div>
  , document.body);
}
