import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";
import { X, Phone, MessageCircle, Mail, FileText, CheckCircle2, Clock, Calendar, Target, AlertCircle, Replace, Trash2 } from "lucide-react";
import LeadProposeModal from "@/pages/erp/modals/LeadProposeModal";
import LeadReviewModal from "@/pages/erp/modals/LeadReviewModal";
import LeadEnrollModal from "@/pages/erp/modals/LeadEnrollModal";
import LeadTransferModal from "@/pages/erp/modals/LeadTransferModal";
import { isSuper } from "@/lib/erpApi";

const parseDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
  } catch(e) { return d; }
};

export default function LeadActivityDrawer({ lead, onClose }) {
  const queryClient = useQueryClient();
  const [noteType, setNoteType] = useState("call");
  const [notes, setNotes] = useState("");
  const [nextFollowup, setNextFollowup] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposeModal, setProposeModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  
  const erpUser = JSON.parse(localStorage.getItem("nw_user") || "{}"); // fallback

  const addInteraction = useMutation({
    mutationFn: async (payload) => await erp.addLeadInteraction(lead.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["erpLeads"]);
      setNotes("");
      toast.success("Activity logged successfully");
    },
    onError: (err) => toast.error("Failed to log activity")
  });

  const handleSave = () => {
    if (!notes.trim()) return toast.error("Please enter some notes");
    setIsSubmitting(true);
    const payload = { type: noteType, notes };
    if (nextFollowup) {
      payload.next_followup_at = new Date(nextFollowup).toISOString();
    }
    addInteraction.mutate(payload, {
      onSettled: () => setIsSubmitting(false)
    });
  };

  const interactions = lead.interactions || [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl bg-background h-full shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
          <div>
            <h2 className="font-bold text-lg">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase tracking-wider">{lead.source || "Manual"}</span>
              <span className="text-xs font-medium text-muted-foreground">{lead.phone}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">{lead.status.replace("_", " ")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition"><X size={18} /></button>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="px-4 py-2 bg-card border-b border-border flex gap-2 overflow-x-auto custom-scrollbar">
          {["new", "contacted", "follow_up"].includes(lead.status) && (
            <button onClick={() => setProposeModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 rounded-lg text-xs font-bold hover:bg-fuchsia-500/20 transition whitespace-nowrap">
              <Target size={14}/> Propose Fee
            </button>
          )}
          {lead.status === "pending_approval" && (isSuper(erpUser) || erpUser?.role === "center_manager") && (
            <button onClick={() => setReviewModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs font-bold hover:bg-orange-500/20 transition whitespace-nowrap">
              <AlertCircle size={14}/> Review Proposal
            </button>
          )}
          {lead.status === "approved_for_accounts" && (isSuper(erpUser) || erpUser?.role === "center_manager" || erpUser?.role === "accountant") && (
            <button onClick={() => setEnrollModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 rounded-lg text-xs font-bold hover:bg-emerald-600/20 transition whitespace-nowrap">
              <CheckCircle2 size={14}/> Process Admission
            </button>
          )}
          <button onClick={() => setTransferModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition whitespace-nowrap">
            <Replace size={14}/> Transfer Branch
          </button>
        </div>

        {/* Content (Timeline) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Add Activity Box */}
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <h3 className="text-sm font-bold mb-3 uppercase text-muted-foreground tracking-wider">Log Activity</h3>
            <div className="flex gap-2 mb-3">
              {[
                { id: "call", icon: Phone, label: "Call" },
                { id: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
                { id: "note", icon: FileText, label: "Note" },
              ].map((t) => {
                const Icon = t.icon;
                const active = noteType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setNoteType(t.id)}
                    className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg border transition ${
                      active ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <Icon size={14} /> {t.label}
                  </button>
                )
              })}
            </div>
            <textarea
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px] mb-3"
              placeholder={`Enter notes for this ${noteType}...`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1"><Calendar size={12}/> Schedule Next Follow-up (Optional)</label>
              <input 
                type="datetime-local" 
                value={nextFollowup} 
                onChange={e => setNextFollowup(e.target.value)} 
                className="w-full bg-background border border-border/50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="mt-3 w-full py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Activity"}
            </button>
          </div>

          {/* Timeline Feed */}
          <div>
            <h3 className="text-sm font-bold mb-4 uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <Clock size={14} /> Activity Timeline
            </h3>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {interactions.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground italic">No interactions recorded yet.</div>
              ) : (
                [...interactions].reverse().map((interaction, i) => {
                  let Icon = FileText;
                  let colorClass = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
                  
                  if (interaction.type === "call") { Icon = Phone; colorClass = "bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:border-sky-800"; }
                  if (interaction.type === "whatsapp") { Icon = MessageCircle; colorClass = "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"; }
                  if (interaction.type === "email") { Icon = Mail; colorClass = "bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800"; }
                  if (interaction.type === "status_change") { Icon = CheckCircle2; colorClass = "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800"; }
                  
                  return (
                    <div key={interaction.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border/60 p-3 rounded-xl shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold capitalize text-foreground">{interaction.type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar size={10}/> {parseDate(interaction.created_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{interaction.notes}</p>
                        <div className="mt-2 text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                          By {interaction.created_by_name || "System"}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Drawer Modals */}
      {proposeModal && <LeadProposeModal lead={lead} onClose={() => setProposeModal(false)} />}
      {reviewModal && <LeadReviewModal lead={lead} onClose={() => setReviewModal(false)} />}
      {enrollModal && <LeadEnrollModal lead={lead} onClose={() => setEnrollModal(false)} />}
      {transferModal && <LeadTransferModal lead={lead} branches={[]} onClose={() => setTransferModal(false)} />}
    </div>
  );
}
