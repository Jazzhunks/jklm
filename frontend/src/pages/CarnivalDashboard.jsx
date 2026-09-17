import React, { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Calendar, GraduationCap, Download, Upload, Loader2, Target, Eye, Database, ListChecks } from "lucide-react";
import { api, formatError, fmtDate } from "@/lib/api";
import { toast } from "sonner";
import BulkProgressModal from "./admin/BulkProgressModal";

export default function CarnivalDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bulkState, setBulkState] = useState({ progress: 0, status: "idle" });
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  
  const uploadInputRef = useRef();

  const { data: carnival, isLoading: loadingCar } = useQuery({
    queryKey: ["admin-carnival", id],
    queryFn: () => api.get(`/admin/wath/carnivals/${id}`).then(r => r.data)
  });

  const { data: regs = [], isLoading: loadingRegs } = useQuery({
    queryKey: ["admin-carnival-regs", id],
    queryFn: () => api.get(`/admin/wath/carnivals/${id}/registrations`).then(r => r.data)
  });

  const loading = loadingCar || loadingRegs;

  const stats = useMemo(() => {
    let totalCap = 0;
    (carnival?.exam_dates || []).forEach(d => {
      (d.slots || []).forEach(s => { totalCap += Number(s.capacity) || 0; });
    });
    const total = regs.length;
    
    const byDate = (carnival?.exam_dates || []).map(d => {
      let cap = 0;
      (d.slots || []).forEach(s => { cap += Number(s.capacity) || 0; });
      const count = regs.filter(r => r.chosen_date === d.date).length;
      return { date: d.date, cap, count, pct: cap ? Math.round((count / cap) * 100) : 0 };
    });
    const tally = (key) => {
      const m = {};
      for (const r of regs) { const k = r[key] || "—"; m[k] = m[k] || 0; m[k]++; }
      return Object.entries(m).sort((a, b) => b[1] - a[1]);
    };
    return {
      totalCap, total, pct: totalCap ? Math.round((total / totalCap) * 100) : 0,
      byDate, byVenue: tally("venue"), byClass: tally("standard")
    };
  }, [regs, carnival]);

  const downloadResultsTemplate = async () => {
    try {
      const res = await api.get(`/admin/scholarships/${id}/results-template`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `results-template-${id}.xlsx`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (e) { toast.error("Failed to download template"); }
  };

  const uploadResults = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkModalOpen(true);
    setBulkState({ progress: 0, status: "uploading" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(`/admin/scholarships/${id}/bulk-results`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) setBulkState({ progress: Math.round((ev.loaded * 100) / ev.total), status: "uploading" });
        }
      });
      setBulkState({ progress: 100, status: "success", data: res.data });
      toast.success(`Results uploaded: ${res.data.processed} processed`);
    } catch (err) {
      setBulkState({ progress: 0, status: "error", error: formatError(err.response?.data?.detail) || err.message });
      toast.error("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-sans relative overflow-hidden">
      <BulkProgressModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} state={bulkState} />
      
      {/* Billion dollar ambient background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-accent/10 to-transparent pointer-events-none opacity-50 blur-3xl" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button type="button" onClick={() => navigate("/admin")} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group">
              <div className="p-1.5 rounded-lg border border-border bg-background/50 group-hover:bg-accent/10 group-hover:border-accent/30 group-hover:text-accent transition-all">
                <ArrowLeft size={14} />
              </div>
              Back to Command Center
            </button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-accent font-bold mb-1.5 flex items-center gap-2">
                <Target size={12} className="text-accent" /> WATH Carnival Intelligence
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white drop-shadow-sm">
                {carnival?.title || "Loading Carnival..."}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <input type="file" className="hidden" ref={uploadInputRef} onChange={uploadResults} accept=".xlsx,.xls" />
            
            <button onClick={downloadResultsTemplate} className="h-12 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold flex items-center gap-2 transition-all backdrop-blur-md text-white">
              <Download size={16} /> Template
            </button>
            <button onClick={() => uploadInputRef.current?.click()} className="h-12 px-5 rounded-xl bg-gradient-to-r from-accent to-[#1a9df4] hover:opacity-90 text-accent-foreground text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(30,160,250,0.3)] hover:shadow-[0_0_30px_rgba(30,160,250,0.5)]">
              <Upload size={16} /> Upload Results
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={32} />
            <div className="text-sm font-medium uppercase tracking-widest">Aggregating Metrics...</div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Registrations", value: stats.total, icon: Users, color: "text-blue-400" },
                { label: "Network Capacity", value: stats.totalCap, icon: Database, color: "text-emerald-400" },
                { label: "Aggregate Fill Rate", value: `${stats.pct}%`, sub: `${stats.total} / ${stats.totalCap} seats allocated`, icon: Target, color: "text-amber-400" },
                { label: "Available Exam Dates", value: carnival?.exam_dates?.length || 0, icon: Calendar, color: "text-purple-400" }
              ].map((kpi, i) => (
                <div key={i} className="glass border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className={`absolute top-0 right-0 p-5 opacity-20 group-hover:opacity-40 transition-opacity ${kpi.color}`}>
                    <kpi.icon size={48} weight="duotone" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">{kpi.label}</div>
                  <div className="font-display text-4xl text-white font-medium drop-shadow-md">{kpi.value}</div>
                  {kpi.sub && <div className="text-[11px] text-muted-foreground mt-2 font-medium">{kpi.sub}</div>}
                </div>
              ))}
            </div>

            {/* Visual Analytics */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 glass border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                  <Calendar size={14} className="text-accent"/> Allocation by Date
                </div>
                {stats.byDate.length === 0 ? (
                  <div className="flex-1 grid place-items-center text-muted-foreground text-sm italic">No slot configurations found</div>
                ) : (
                  <div className="space-y-5 flex-1 justify-center flex flex-col">
                    {stats.byDate.map(d => (
                      <div key={d.date} className="group">
                        <div className="flex items-end justify-between mb-2">
                          <div className="text-sm font-bold text-white tracking-wide">{d.date}</div>
                          <div className="text-xs font-mono text-muted-foreground"><span className="text-accent font-bold">{d.count}</span> / {d.cap} booked</div>
                        </div>
                        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-[#1a9df4] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(30,160,250,0.5)]" style={{ width: `${Math.min(100, d.pct)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass border border-white/5 rounded-3xl p-6 flex-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground mb-5">
                    <GraduationCap size={14} className="text-emerald-400"/> Demographic by Class
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {stats.byClass.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    {stats.byClass.map(([cl, n]) => (
                      <div key={cl} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <span className="text-sm font-medium text-white/90">{cl}</span>
                        <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Registry Database */}
            <div className="glass border border-white/5 rounded-3xl overflow-hidden mt-8 flex flex-col">
              <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl text-white font-medium">Aspirant Registry</h3>
                  <p className="text-xs text-muted-foreground mt-1">Live synchronized applicant ledger</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                  <Eye size={12} /> {regs.length} Active Records
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/20 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">App ID</th>
                      <th className="px-6 py-4 whitespace-nowrap">Aspirant Name</th>
                      <th className="px-6 py-4 whitespace-nowrap">Mobile</th>
                      <th className="px-6 py-4 whitespace-nowrap">Standard</th>
                      <th className="px-6 py-4 whitespace-nowrap">Allocated Date</th>
                      <th className="px-6 py-4 whitespace-nowrap">Slot</th>
                      <th className="px-6 py-4 text-center whitespace-nowrap">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {regs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-muted-foreground italic font-medium">
                          No registrants detected in the matrix.
                        </td>
                      </tr>
                    ) : (
                      regs.map(r => (
                        <tr key={r.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs text-accent font-medium">{r.application_no}</td>
                          <td className="px-6 py-4 font-semibold text-white">{r.name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground group-hover:text-white/80 transition-colors">{r.phone}</td>
                          <td className="px-6 py-4">{r.standard || "—"}</td>
                          <td className="px-6 py-4 text-emerald-400 font-medium text-xs">{r.chosen_date || "—"}</td>
                          <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{r.chosen_slot_time || "—"}</td>
                          <td className="px-6 py-4 text-center">
                            {r.result_published ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-accent/20 border border-accent/30 text-accent px-2.5 py-1 rounded-md font-bold">
                                <ListChecks size={10} /> Published ({r.result_marks_obtained || 0})
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 text-muted-foreground px-2.5 py-1 rounded-md font-bold">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
