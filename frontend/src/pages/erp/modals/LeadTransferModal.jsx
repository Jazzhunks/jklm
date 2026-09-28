import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
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

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); transfer.mutate(); }} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-sm p-5 space-y-4">
        <h3 className="font-bold text-lg">Transfer Lead</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Transfer <strong>{lead.name}</strong> to a different branch. A counselor from that branch will take over.</p>
        
        <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Destination Branch *</label>
        <select required value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2">
          <option value="">-- Select Branch --</option>
          {activeBranches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select></div>
        
        <div><label className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Transfer Notes</label>
        <textarea required value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2 min-h-[60px]" placeholder="Reason for transfer..." /></div>
        
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300">Cancel</Button>
          <Button type="submit" disabled={transfer.isPending} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300">{transfer.isPending ? "Transferring..." : "Transfer Lead"}</Button>
        </div>
      </form>
    </div>
  , document.body);
}
