import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, fmtDate, extractItems } from "@/lib/erpApi";
import { formatError } from "@/lib/api";
import { Plus, X, UserX, Search, ShieldAlert, KeyRound, Smartphone, Mail, Edit3, Save } from "lucide-react";

const ROLES = ["center_manager", "accountant", "counsellor", "attendance"];

const ROLE_STYLES = {
  super_admin: "bg-rose-500/12 text-rose-800 dark:text-rose-400 border-rose-500/20",
  admin: "bg-rose-500/12 text-rose-800 dark:text-rose-400 border-rose-500/20",
  center_manager: "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/20",
  accountant: "bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/20",
  counsellor: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/20",
  attendance: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/20",
};

export default function ErpStaff() {
  const { erpUser, selectedBranchId } = useOutletContext();
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // Tracks the personnel profile currently loading changes
  const [busyRows, setBusyRows] = useState(new Set());

  // Sync branch
  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setBranchId(selectedBranchId);
    }
  }, [selectedBranchId]);

  const reload = () => {
    erp.listStaff(branchId || undefined)
      .then(res => setItems(extractItems(res)))
      .catch(e => toast.error(formatError(e) || "Failed to load team roster profiles"));
  };

  useEffect(() => { erp.listBranches().then(setBranches); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [branchId]);

  const toggleDeactivate = async (id, name) => {
    if (busyRows.has(id)) return;
    if (!window.confirm(`Deactivate access profile for ${name}? They will lose immediate database visibility.`)) return;
    
    setBusyRows(prev => { const next = new Set(prev); next.add(id); return next; });
    try {
      await erp.deactivateStaff(id);
      toast.success(`Access permissions revoked for ${name}`);
      reload();
    } catch (e) {
      toast.error(formatError(e.response?.data?.detail) || "Failed to modify authorization status");
    } finally {
      setBusyRows(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const filteredItems = items.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role?.toLowerCase().replace("_", " ").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col min-h-0 animate-fadeIn bg-slate-50 dark:bg-black" data-testid="erp-staff-page">
      {/* Header Panel */}
      <div className="flex justify-between items-end flex-wrap gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Human Capital Stack</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Team Roster</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">
            {filteredItems.length} active enterprise execution profiles mapped in directory view.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2" 
          data-testid="create-staff-btn"
        >
          <Plus size={14}/> Add Staff Member
        </Button>
      </div>

      {/* Navigation Parameter Tracks */}
      <div className="flex gap-3 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
          <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
            type="text"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search roster fields by identity description, role layout name, or authorization email..." 
            className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-9 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300"
          />
        </div>
        {isSuper(erpUser) && (
          <select className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
            value={branchId} 
            onChange={e => setBranchId(e.target.value)} 
            className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50 min-w-[200px]" 
            data-testid="filter-branch"
          >
            <option value="">All active network branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* Main Container Core Table Grid */}
      <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] w-full flex flex-col flex-1 min-h-0">
        <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
            <table className="w-full text-sm table-fixed border-collapse min-w-[850px]">
              <thead className="sticky top-0 z-20 bg-white dark:bg-[#111]">
                <tr className="text-left">
                  <th className="w-[20%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Staff Identity</th>
                  <th className="w-[23%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Authorization Email</th>
                  <th className="w-[15%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Role Profile</th>
                  <th className="w-[17%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Branch Station</th>
                  <th className="w-[15%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-left">Joined Date</th>
                  <th className="w-[10%] text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-200 dark:border-white/[0.06] text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04]">
                {filteredItems.map(s => (
                  <tr key={s.id} className={`hover:bg-slate-100 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.04] last:border-0 transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group ${s.active === false ? "opacity-35" : ""}`} data-testid={`staff-row-${s.id}`}>
                    <td className="py-3 px-4 text-[13px] text-slate-800 dark:text-zinc-200 font-medium truncate">{s.name}</td>
                    <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 font-mono truncate" title={s.email}>{s.email}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase border ${ROLE_STYLES[s.role] || "bg-slate-200/50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]"}`}>
                        {s.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 font-medium truncate">
                      {branches.find(b => b.id === s.branch_id)?.name || "Network Core Global"}
                    </td>
                    <td className="py-3 px-4 text-[13px] text-slate-600 dark:text-zinc-400 font-mono whitespace-nowrap">{fmtDate(s.created_at)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => setEditingStaff(s)} disabled={s.active === false} title="Edit Profile Configuration" className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-30 p-1.5 w-8 h-8 justify-center"
                        >
                          <Edit3 size={14}/>
                        </Button>
                        
                        {s.active !== false ? (
                          <Button disabled={busyRows.has(s.id)} onClick={() => toggleDeactivate(s.id, s.name)} title="Revoke Permissions" className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-rose-500 hover:border-rose-500/20 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-500/10 px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-40 p-1.5 w-8 h-8 justify-center" 
                            data-testid={`deactivate-${s.id}`}
                          >
                            <UserX size={14}/>
                          </Button>
                        ) : (
                          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-rose-500 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 rounded-full select-none">Inactive</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500 dark:text-zinc-400 italic text-[13px]">
                      No matching personnel access records found inside current execution space parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Creation Wizard Dialog Layer */}
      {showCreate && (
        <CreateStaffModal
          erpUser={erpUser}
          branches={branches}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); reload(); toast.success("New personnel profile deployed safely"); }}
        />
      )}

      {/* Profile Modification Wizard Dialog Layer */}
      {editingStaff && (
        <UpdateStaffModal
          erpUser={erpUser}
          branches={branches}
          staffMember={editingStaff}
          onClose={() => setEditingStaff(null)}
          onUpdated={() => { setEditingStaff(null); reload(); toast.success("Personnel profile configuration synchronized successfully"); }}
        />
      )}
    </div>
  );
}

// ============================================================================
// PERSONNEL PROFILE CREATION MODAL COMPONENT
// ============================================================================
function CreateStaffModal({ erpUser, branches, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "accountant",
    branch_id: isSuper(erpUser) ? "" : erpUser.branch_id,
  });
  const [busy, setBusy] = useState(false);

  const allowedRoles = isSuper(erpUser) ? ROLES : ROLES.filter(r => r !== "center_manager");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await erp.createStaff(form);
      onCreated();
    } catch (e) { 
      toast.error(formatError(e.response?.data?.detail) || "Failed to finalize database credentials allocation parameters"); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 backdrop-blur-sm transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]" onClick={onClose} data-testid="create-staff-modal">
      <form onClick={e => e.stopPropagation()} onSubmit={submit} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[16px] max-w-md w-full p-6 space-y-5 shadow-2xl relative shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3 flex items-center gap-1">
              <ShieldAlert size={12}/> Access Permission Layer
            </div>
            <h3 className="text-[20px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100 mt-1">Add Team Member</h3>
          </div>
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] p-2 transition-all duration-300 w-8 h-8 flex items-center justify-center"><X size={18}/></Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Full Name *</label>
            <input required placeholder="E.g. Junaid Ahmad" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" data-testid="cs-name"/>
          </div>
          
          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">System Login Email *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"><Mail size={14}/></span>
              <input required type="email" placeholder="username@northendedu.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-10 text-[13px] font-mono text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" data-testid="cs-email"/>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Primary Mobile Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"><Smartphone size={14}/></span>
              <input type="text" placeholder="Contact string" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-10 text-[13px] font-mono text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" data-testid="cs-phone"/>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Initial Security Password *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"><KeyRound size={14}/></span>
              <input required type="password" placeholder="••••••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-10 text-[13px] font-mono text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" data-testid="cs-password"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Assigned Role *</label>
              <select required value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50" data-testid="cs-role">
                {allowedRoles.map(r => <option key={r} value={r}>{r.replace("_", " ").toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Station Branch *</label>
              <select required value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} disabled={!isSuper(erpUser)} className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50 disabled:opacity-50" data-testid="cs-branch">
                <option value="">— Choose Station —</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button disabled={busy} type="submit" className="flex-1 bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50" data-testid="cs-submit">
            {busy ? "Authorizing Personnel Parameters…" : "Deploy Staff Access Instance"}
          </Button>
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2">Cancel</Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// PERSONNEL PROFILE EDIT/UPDATE MODAL COMPONENT (WITH PASSWORD HASHER PASSES)
// ============================================================================
function UpdateStaffModal({ erpUser, branches, staffMember, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: staffMember.name || "",
    phone: staffMember.phone || "",
    role: staffMember.role || "accountant",
    branch_id: staffMember.branch_id || "",
    new_password: "" // Left empty intentionally; only sent to backend if updated by admin
  });
  const [busy, setBusy] = useState(false);

  const allowedRoles = isSuper(erpUser) ? ROLES : ROLES.filter(r => r !== "center_manager");

  const submitUpdate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      // Strip password string parameter from payload if no changes are made
      if (!payload.new_password.trim()) {
        delete payload.new_password;
      }
      
      await erp.updateStaff(staffMember.id, payload);
      onUpdated();
    } catch (e) {
      toast.error(formatError(e.response?.data?.detail) || "Failed to commit credential changes to database records");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 backdrop-blur-sm transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submitUpdate} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] max-w-md w-full p-6 space-y-5 shadow-2xl relative shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3 flex items-center gap-1">
              <ShieldAlert size={12}/> Modifying Credentials Loop
            </div>
            <h3 className="text-[20px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100 mt-1">Edit Staff Profile</h3>
            <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-0.5 font-mono">{staffMember.email}</p>
          </div>
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] p-2 transition-all duration-300 w-8 h-8 flex items-center justify-center"><X size={18}/></Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Full Name *</label>
            <input required placeholder="E.g. Junaid Ahmad" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 text-[13px] text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" />
          </div>
          
          <div>
            <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Primary Mobile Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"><Smartphone size={14}/></span>
              <input type="text" placeholder="Contact string" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-10 text-[13px] font-mono text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 block">Force Security Password Reset</label>
              <span className="text-[9px] uppercase font-bold tracking-wider text-teal-600 font-mono bg-teal-600/5 border border-teal-600/10 px-2 py-0.5 rounded">Optional</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"><KeyRound size={14}/></span>
              <input type="password" placeholder="Leave empty to retain current password" value={form.new_password} onChange={e => setForm({...form, new_password: e.target.value})} className="w-full bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full py-2 px-4 pl-10 text-[13px] font-mono text-slate-600 dark:text-zinc-400 placeholder:text-zinc-700 focus:border-teal-600/50 focus:bg-teal-600/[0.05] focus:outline-none transition-all duration-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Assigned Role *</label>
              <select required value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50">
                {allowedRoles.map(r => <option key={r} value={r}>{r.replace("_", " ").toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400 mb-1 block">Station Branch *</label>
              <select required value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} disabled={!isSuper(erpUser)} className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50 disabled:opacity-50">
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button disabled={busy} type="submit" className="flex-1 bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={14} className="mr-1.5"/> {busy ? "Synchronizing Records..." : "Commit Update Changes"}
          </Button>
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2">Cancel</Button>
        </div>
      </form>
    </div>
  );
}
