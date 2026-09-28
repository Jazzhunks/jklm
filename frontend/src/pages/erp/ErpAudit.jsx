import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { erp, fmtDate } from "@/lib/erpApi";
import { Search, ShieldAlert, X, Eye, FileText, Calendar, ShieldCheck } from "lucide-react";

export default function ErpAudit() {
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayload, setSelectedPayload] = useState(null);

  useEffect(() => { erp.listBranches().then(setBranches); }, []);
  
  useEffect(() => {
    erp.audit(branchId ? { branch_id: branchId } : {}).then(setItems);
  }, [branchId]);

  // Client-side quick filter for actor emails, action states, or entities
  const filteredItems = items.filter(item => 
    item.actor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.entity?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-black p-6 h-[calc(100vh-120px)] flex flex-col min-h-0 animate-fadeIn" data-testid="erp-audit-page">
      {/* Header Panel */}
      <div className="shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Compliance &amp; Oversight</div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">System Audit Log</h1>
        <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">Reviewing last {filteredItems.length} records matching security verification rules.</p>
      </div>

      {/* Filter and Control Strips */}
      <div className="flex gap-3 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
          <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
            type="text"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Filter audit logs by actor email, target action, or entity signature..." 
            className="bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 pl-9 pr-4 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:outline-none transition-all w-full"
          />
        </div>
        <select className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
          value={branchId} 
          onChange={e => setBranchId(e.target.value)} 
          className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50 min-w-[200px]" 
          data-testid="filter-branch"
        >
          <option value="">All enterprise branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Main Container (Independent Scroll Fixed Layer) */}
      <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] w-full flex flex-col flex-1 min-h-0">
        <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
          <table className="w-full text-sm table-auto border-collapse">
            <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <tr className="text-left backdrop-blur-md">
                <th className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Timestamp</th>
                <th className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">System Actor</th>
                <th className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Role Access</th>
                <th className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Action</th>
                <th className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Target Entity</th>
                <th className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left px-4">Payload Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-slate-50 dark:bg-black/20">
              {filteredItems.map(a => (
                <tr key={a.id} className="hover:bg-slate-100 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.04] transition-colors group">
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs whitespace-nowrap text-slate-500 dark:text-zinc-400 font-mono">
                    <span className="text-slate-800 dark:text-zinc-200">{fmtDate(a.created_at)}</span>{" "}
                    <span className="opacity-60">{a.created_at?.slice(11, 16)}</span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs font-medium text-slate-800 dark:text-zinc-200">{a.actor_email}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200/50 dark:bg-white/[0.04]/50 border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400">
                      {a.actor_role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs">
                    <ActionBadge action={a.action} />
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs text-slate-800 dark:text-zinc-200 font-medium whitespace-nowrap">{a.entity}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 text-xs max-w-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500 dark:text-zinc-400 font-mono truncate block flex-1">
                        {JSON.stringify(a.payload)}
                      </span>
                      {a.payload && (
                        <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
                          onClick={() => setSelectedPayload({ actor: a.actor_email, action: a.action, entity: a.entity, data: a.payload })}
                          className="p-1 text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 shrink-0"
                          title="Inspect Data State"
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-slate-500 dark:text-zinc-400 italic text-sm">
                    No historic verification changes logged matching current tracking parameter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* Interactive Payload Inspector Sheets */}
      {selectedPayload && (
        <PayloadInspectorModal target={selectedPayload} onClose={() => setSelectedPayload(null)} />
      )}
    </div>
  );
}

// --- CONTEXT DRIVEN BADGES LAYER ---
function ActionBadge({ action }) {
  const norm = action?.toLowerCase() || "";
  let config = "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase"; // Update/Patch fallback
  
  if (norm.includes("create") || norm.includes("post") || norm.includes("admit")) {
    config = "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase";
  } else if (norm.includes("delete") || norm.includes("remove") || norm.includes("deactivate") || norm.includes("reject")) {
    config = "bg-rose-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-rose-300 dark:border-red-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase";
  } else if (norm.includes("approve") || norm.includes("login")) {
    config = "bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase";
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${config}`}>
      {action}
    </span>
  );
}

// --- INTERACTIVE METADATA INSPECTION LAYER ---
function PayloadInspectorModal({ target, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex justify-between items-start shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3 flex items-center gap-1">
              <ShieldCheck size={12}/> Security Ledger Inspector
            </div>
            <h3 className="font-display text-2xl font-medium mt-1">Data State Transaction</h3>
          </div>
          <Button type="button" onClick={onClose} className="p-1 hover:bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-lg border border-transparent hover:border-slate-200 dark:border-white/[0.08] transition"><X size={18}/></Button>
        </div>

        <div className="space-y-2 text-xs border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/10 p-4 rounded-xl font-mono shrink-0">
          <p><span className="text-slate-500 dark:text-zinc-400">Actor:</span> <span className="text-slate-800 dark:text-zinc-200 font-semibold">{target.actor}</span></p>
          <p><span className="text-slate-500 dark:text-zinc-400">Execution:</span> <span className="text-slate-800 dark:text-zinc-200 font-semibold">{target.action} ({target.entity})</span></p>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black p-4">
          <pre className="text-xs text-emerald-600 font-mono leading-relaxed whitespace-pre-wrap font-medium">
            {JSON.stringify(target.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}