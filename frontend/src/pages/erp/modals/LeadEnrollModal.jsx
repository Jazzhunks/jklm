import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";

export default function LeadEnrollModal({ lead, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: lead.name || "",
    contact_phone: lead.phone || "",
    current_class: lead.moving_to_class || "",
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
  
  const enroll = useMutation({
    mutationFn: () => erp.enrollLead(lead.id, { ...form, deposit_amount: Number(form.deposit_amount), total_fee: Number(form.total_fee) }),
    onSuccess: (data) => { toast.success("Admission Processed Successfully!"); queryClient.invalidateQueries(["erpLeads", "erpStudents"]); onClose(); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to process admission")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); enroll.mutate(); }} className="bg-background border border-border rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8">
        <div>
          <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Accounts Department</div>
          <h3 className="font-display font-medium text-xl">Finalize Admission</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Student Name *</label>
          <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Student Phone *</label>
          <input required value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Class *</label>
          <input required value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Batch</label>
          <input value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Parent Name *</label>
          <input required value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Parent Phone *</label>
          <input required value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1">Parent Email</label>
          <input type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" /></div>
        </div>

        <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1">Fee & Deposit Verification</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold block mb-1">Approved Total Fee (₹) *</label>
            <input required type="number" value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded text-emerald-600 font-black" /></div>
            <div><label className="text-xs font-bold block mb-1">Initial Deposit Amount (₹) *</label>
            <input required type="number" value={form.deposit_amount} onChange={e => setForm({...form, deposit_amount: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded font-bold" placeholder="Amount collected today" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold block mb-1">Payment Mode *</label>
            <select required value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded">
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="pos">Card (POS)</option>
            </select></div>
            <div><label className="text-xs font-bold block mb-1">Ref / Txn ID</label>
            <input value={form.payment_reference} onChange={e => setForm({...form, payment_reference: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded" placeholder="Optional" /></div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" disabled={enroll.isPending} className="px-5 py-2 text-sm bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90">{enroll.isPending ? "Processing..." : "Process Admission & Convert Lead"}</button>
        </div>
      </form>
    </div>
  );
}
