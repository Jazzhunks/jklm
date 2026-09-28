import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, extractItems } from "@/lib/erpApi";
import { formatError, api } from "@/lib/api";
import { Printer, Search, CheckSquare, Square, Contact2, X } from "lucide-react";

export default function ErpIdCards() {
  const { erpUser, selectedBranchId } = useOutletContext();
  const [queue, setQueue] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setBranchId(selectedBranchId);
    }
  }, [selectedBranchId]);

  const loadBranches = useCallback(() => {
    erp.listBranches().then(setBranches).catch(() => {});
  }, []);

  const loadQueue = useCallback(() => {
    const params = {};
    if (branchId) params.branch_id = branchId;
    erp.idCardQueue(params)
      .then(res => setQueue(extractItems(res)))
      .catch(e => toast.error(formatError(e) || "Failed to load ID card queue"));
  }, [branchId]);

  useEffect(() => { loadBranches(); }, [loadBranches]);
  useEffect(() => { loadQueue(); }, [loadQueue]);

  useEffect(() => {
    const id = setInterval(() => { loadQueue(); }, 30000);
    return () => clearInterval(id);
  }, [loadQueue]);

  const filteredQueue = queue.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.batch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQueue.length && filteredQueue.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQueue.map(s => s.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const downloadIdCard = async (student) => {
    try {
      const url = `/erp/students/${encodeURIComponent(student.id)}/id-card`;
      const res = await api.get(url, { responseType: 'blob' });
      const blob = res.data;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `id-card-${student.enrollment_number || student.student_no}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error(formatError(e) || "Failed to download ID card");
    }
  };

  const handleGenerateAndPrint = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one student to generate ID cards");
      return;
    }
    setGenerating(true);
    try {
      const selectedIdsArr = Array.from(selectedIds);
      const res = await api.post('/erp/id-cards/bulk-download', { student_ids: selectedIdsArr }, { responseType: 'blob' });
      const blob = res.data;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `bulk-id-cards.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      await api.post("/erp/id-cards/clear-queue", { student_ids: selectedIdsArr });
      setSelectedIds(new Set());
      loadQueue();
      toast.success("Bulk ID cards downloaded and queue cleared");
    } catch (e) {
      toast.error(formatError(e) || "Failed to generate ID cards");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col min-h-0 animate-fadeIn relative bg-slate-50 dark:bg-black">
      <div className="flex justify-between items-end flex-wrap gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Credential Production Deck</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">ID Card Queue</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">{filteredQueue.length} student{filteredQueue.length === 1 ? "" : "s"} queued for ID card generation.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Button onClick={clearSelection} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2">
              Clear Choice ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleGenerateAndPrint} disabled={generating || selectedIds.size === 0} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-50">
            <Printer size={14}/> {generating ? "Generating..." : "Generate & Download ID Cards"}
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"/>
          <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
            type="text"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search queue by name, enrollment, or batch..." 
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50"
          />
        </div>
        {isSuper(erpUser) && (
          <select className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
            value={branchId} 
            onChange={e => setBranchId(e.target.value)} 
            className="min-w-[200px] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
          >
            <option value="">All branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] w-full flex flex-col flex-1 min-h-0">
        <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 min-h-0 relative">
        <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar">
          <table className="w-full text-sm table-fixed border-collapse min-w-[750px]">
            <thead className="bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <tr className="text-left backdrop-blur-md">
                <th className="w-[6%] px-5 py-3.5 text-center bg-slate-200/50 dark:bg-white/[0.04] cursor-pointer" onClick={toggleSelectAll} title="Select All">
                  <div className="flex justify-center items-center hover:text-slate-800 dark:text-zinc-200 transition-colors">
                    {selectedIds.size === filteredQueue.length && filteredQueue.length > 0 ? (
                      <CheckSquare size={16} className="text-teal-800 dark:text-teal-300"/>
                    ) : (
                      <Square size={16} className="text-slate-500 dark:text-zinc-400/50 hover:text-teal-800 dark:text-teal-300 transition-colors"/>
                    )}
                  </div>
                </th>
                <th className="w-[18%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Student No</th>
                <th className="w-[25%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Learner Profile Name</th>
                <th className="w-[18%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Class Batch Allocation</th>
                <th className="w-[15%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Enrollment Number</th>
                <th className="w-[18%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Contact Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-slate-50 dark:bg-black/20">
              {filteredQueue.map(s => {
                const isChecked = selectedIds.has(s.id);
                return (
                  <tr 
                    key={s.id} 
                    onClick={() => toggleSelect(s.id)}
                    className={`cursor-pointer transition-colors ${isChecked ? "bg-teal-600/5 hover:bg-teal-600/10" : "hover:bg-slate-200/50 dark:bg-white/[0.04]/50"}`}
                  >
                    <td className="px-5 py-4 text-center">
                      <div className="text-teal-800 dark:text-teal-300 flex justify-center items-center">
                        {isChecked ? <CheckSquare size={16} className="text-teal-800 dark:text-teal-300"/> : <Square size={16} className="text-slate-500 dark:text-zinc-400/30"/>}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold tracking-wide">{s.student_no}</td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{s.full_name}</td>
                    <td className="px-5 py-4 text-xs text-slate-800 dark:text-zinc-200 font-medium truncate">{s.batch || "—"}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-800 dark:text-zinc-200">{s.enrollment_number || "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">{s.contact_phone}</td>
                  </tr>
                );
              })}
              {filteredQueue.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-slate-500 dark:text-zinc-400 italic text-sm">
                    No students queued for ID card generation. Go to student profile and click "Generate ID Card" to queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
