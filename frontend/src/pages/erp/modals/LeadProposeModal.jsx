import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";

export default function LeadProposeModal({ lead, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ proposed_fee: "", moving_to_class: lead.moving_to_class || "", batch_name: "", notes: "" });
  
  const propose = useMutation({
    mutationFn: () => erp.proposeLead(lead.id, { ...form, proposed_fee: Number(form.proposed_fee) }),
    onSuccess: () => {
      toast.success("Fee proposed successfully");
      queryClient.invalidateQueries(["erpLeads"]);
      onClose();
    },
    onError: () => toast.error("Failed to propose fee")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); propose.mutate(); }} className="bg-background border border-border rounded-xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <h3 className="font-bold text-lg">Propose Admission</h3>
        <p className="text-xs text-muted-foreground">Propose a final fee and target class. This will go to a Manager for approval.</p>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Target Class *</label>
        <input required value={form.moving_to_class} onChange={e => setForm({...form, moving_to_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Proposed Total Fee (₹) *</label>
        <input required type="number" min="0" value={form.proposed_fee} onChange={e => setForm({...form, proposed_fee: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Batch (Optional)</label>
        <input value={form.batch_name} onChange={e => setForm({...form, batch_name: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Notes / Reason for concession</label>
        <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded min-h-[60px]" /></div>
        
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" disabled={propose.isPending} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90">{propose.isPending ? "Submitting..." : "Submit Proposal"}</button>
        </div>
      </form>
    </div>
  );
}
