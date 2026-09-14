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
    onError: () => toast.error("Failed to approve")
  });

  const reject = useMutation({
    mutationFn: () => erp.rejectLead(lead.id, { notes }),
    onSuccess: () => { toast.success("Fee rejected. Returned to counselor."); queryClient.invalidateQueries(["erpLeads"]); onClose(); },
    onError: () => toast.error("Failed to reject")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <h3 className="font-bold text-lg">Review Proposed Fee</h3>
        
        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Prospect:</span> <span className="font-bold">{lead.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Target Class:</span> <span className="font-bold">{lead.moving_to_class}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Batch:</span> <span className="font-bold">{lead.proposed_batch || "-"}</span></div>
          <div className="flex justify-between pt-2 border-t border-border/50"><span className="text-muted-foreground font-bold uppercase text-[10px]">Proposed Fee:</span> <span className="font-black text-emerald-500">₹{lead.proposed_fee}</span></div>
        </div>

        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Approval / Rejection Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 text-sm border border-border bg-card rounded min-h-[60px]" placeholder="Add remarks for the counselor or accounts..." /></div>
        
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={() => reject.mutate()} disabled={reject.isPending || approve.isPending} className="px-3 py-1.5 text-sm bg-rose-500/10 text-rose-500 font-bold rounded hover:bg-rose-500/20">{reject.isPending ? "..." : "Reject"}</button>
          <button onClick={() => approve.mutate()} disabled={reject.isPending || approve.isPending} className="px-3 py-1.5 text-sm bg-emerald-500 text-white font-bold rounded hover:bg-emerald-600">{approve.isPending ? "..." : "Approve Fee"}</button>
        </div>
      </div>
    </div>
  );
}
