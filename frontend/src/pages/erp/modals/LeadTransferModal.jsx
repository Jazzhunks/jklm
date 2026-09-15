import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";

export default function LeadTransferModal({ lead, branches, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ branch_id: "", notes: "" });
  
  const { data: fetchBranches = [] } = useQuery({
    queryKey: ['erp-branches-all'],
    queryFn: erp.listBranches,
    enabled: !branches || branches.length === 0
  });
  
  const activeBranches = branches?.length > 0 ? branches : fetchBranches;
  
  const transfer = useMutation({
    mutationFn: () => erp.transferLead(lead.id, form),
    onSuccess: () => {
      toast.success("Lead transferred successfully");
      queryClient.invalidateQueries(["erpLeads"]);
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.detail || "Failed to transfer lead")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); transfer.mutate(); }} className="bg-background border border-border rounded-xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <h3 className="font-bold text-lg">Transfer Lead</h3>
        <p className="text-xs text-muted-foreground">Transfer <strong>{lead.name}</strong> to a different branch. A counselor from that branch will take over.</p>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Destination Branch *</label>
        <select required value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
          <option value="">-- Select Branch --</option>
          {activeBranches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select></div>
        
        <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Transfer Notes</label>
        <textarea required value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded min-h-[60px]" placeholder="Reason for transfer..." /></div>
        
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" disabled={transfer.isPending} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90">{transfer.isPending ? "Transferring..." : "Transfer Lead"}</button>
        </div>
      </form>
    </div>
  );
}
