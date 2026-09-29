import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";
import { formatError } from "@/lib/api";
import { Save, X, Building2, MapPin, Phone, ShieldCheck } from "lucide-react";

export default function ErpBranches() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { erp.listBranches().then(setItems); }, []);

  const openEditModal = (b) => {
    setEditing(b.id);
    setForm({
      code: b.code || (b.name?.toLowerCase().includes("parray") ? "PP" : ""),
      gstin: b.gstin || "",
      signatory_name: b.signatory_name || "",
      state_code: b.state_code || "",
    });
  };

  const executeSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await erp.updateBranch(editing, form);
      setItems(items.map(i => i.id === updated.id ? updated : i));
      setEditing(null);
      toast.success("Branch localization profiles updated successfully");
    } catch (e) { 
      toast.error(formatError(e.response?.data?.detail) || "Failed to finalize configuration state"); 
    } finally { 
      setBusy(false); 
    }
  };

  const getBranchCode = (b) => {
    if (b.code) return b.code.toUpperCase();
    const nameLower = (b.name || "").toLowerCase();
    if (nameLower.includes("parray")) return "PP";
    if (nameLower.includes("90")) return "NFT";
    if (nameLower.includes("anantnag")) return "ANG";
    if (nameLower.includes("sopore")) return "SOP";
    if (nameLower.includes("zakura")) return "ZAK";
    if (nameLower.includes("soura")) return "SOU";
    return (b.name || "BR").slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fadeIn bg-slate-50 dark:bg-black" data-testid="erp-branches-page">
      {/* Pinned Title Board */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Enterprise Infrastructure</div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Network Hub Centres</h1>
        <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">Configure branch roll codes, localized taxation metrics, GSTIN parameters, and legal authorized signatories for each valley hub.</p>
      </div>

      {/* Grid Network Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {items.map(b => (
          <div key={b.id} className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px]" data-testid={`branch-card-${b.id}`}>
            <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 relative group hover:border-teal-600/30 transition-all duration-[350ms]">
            <div className="absolute right-0 top-0 opacity-[0.02] translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 text-slate-800 dark:text-zinc-200 pointer-events-none">
              <Building2 size={160} />
            </div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1.5 max-w-[80%]">
                <h3 className="text-[18px] font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  {b.name}
                  <span className="bg-teal-600/10 text-teal-800 dark:text-teal-300 text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border border-teal-600/20" title="Branch Code for Student IDs">
                    {getBranchCode(b)}
                  </span>
                </h3>
                <p className="text-[12px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 leading-relaxed">
                  <MapPin size={13} className="text-teal-800 dark:text-teal-300 shrink-0" /> {b.address}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5">
                  <Phone size={13} className="opacity-60 shrink-0" /> {b.phone}
                </p>
              </div>
              <Button 
                onClick={() => openEditModal(b)} 
                className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2" 
                data-testid={`edit-branch-${b.id}`}
              >
                Configure
              </Button>
            </div>

            {/* Financial & ID Metadata Grid Segment */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-200 dark:border-white/[0.08] pt-4 relative z-10">
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Student ID Code</div>
                <div className="font-mono text-xs text-teal-800 dark:text-teal-300 font-bold mt-0.5 tracking-wide">{getBranchCode(b)}00001</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Taxation GSTIN</div>
                <div className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold mt-0.5 tracking-wide truncate">{b.gstin || "—"}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Legal Signatory</div>
                <div className="text-xs text-slate-800 dark:text-zinc-200 font-medium mt-0.5 truncate">{b.signatory_name || "—"}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">State Location</div>
                <div className="font-mono text-xs text-slate-800 dark:text-zinc-200 mt-0.5">
                  {b.state_code ? `${b.state_code} (J&K)` : "01 (J&K)"}
                </div>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Modal Sheet Portal */}
      {editing && (
        <div className="fixed inset-0 bg-black/20 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setEditing(null)} data-testid="edit-branch-modal">
          <form 
            onClick={e => e.stopPropagation()} 
            onSubmit={executeSave} 
            className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                  <ShieldCheck size={12} /> Compliance Controller
                </div>
                <h3 className="font-display text-2xl font-medium mt-1">Branch Parameters</h3>
              </div>
              <Button 
                type="button" 
                onClick={() => setEditing(null)} 
                className="p-1 hover:bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-lg border border-transparent hover:border-slate-200 dark:border-white/[0.08] transition"
              >
                <X size={18}/>
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">
                  Branch Code (Student ID Prefix) *
                </label>
                <input 
                  type="text"
                  required
                  value={form.code || ""} 
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase().trim()})}
                  placeholder="e.g. PP, NFT, ANG" 
                  maxLength={6}
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50" 
                  data-testid="eb-code"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-sans">
                  Students enrolled here will receive sequence IDs starting with this prefix (e.g. <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold">{form.code || "PP"}00001</span>).
                </p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Taxation GSTIN Reference</label>
                <input 
                  type="text"
                  value={form.gstin} 
                  onChange={e => setForm({...form, gstin: e.target.value.toUpperCase()})}
                  placeholder="01ABCDE1234F1Z5" 
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50" 
                  data-testid="eb-gstin"
                />
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Authorized Signatory Name</label>
                <input 
                  type="text"
                  value={form.signatory_name} 
                  onChange={e => setForm({...form, signatory_name: e.target.value})} 
                  placeholder="e.g. Legal Operations Desk"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50" 
                  data-testid="eb-signatory"
                />
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1 block">Jurisdiction State Code</label>
                <input 
                  type="text"
                  value={form.state_code} 
                  onChange={e => setForm({...form, state_code: e.target.value})} 
                  placeholder="01" 
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50" 
                  data-testid="eb-state"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                disabled={busy} 
                type="submit" 
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition" 
                data-testid="eb-save"
              >
                <Save size={14}/>
                {busy ? "Writing Records…" : "Authorize Changes"}
              </Button>
              <Button 
                type="button" 
                onClick={() => setEditing(null)} 
                className="px-4 py-3 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}