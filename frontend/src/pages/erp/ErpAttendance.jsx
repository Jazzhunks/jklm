import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, isManagerPlus, fmtDate, extractItems } from "@/lib/erpApi";
import { formatError, API_BASE } from "@/lib/api";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { 
  QrCode, Users, Clock, ShieldAlert, Wifi, WifiOff, FileDown,
  Terminal, Search, UserCheck, CheckCircle2, AlertCircle, Volume2, VolumeX, User, X
} from "lucide-react";

export default function ErpAttendance() {
  const { erpUser, selectedBranchId } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(selectedBranchId || erpUser?.branch_id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [overrideSearch, setOverrideSearch] = useState("");
  const [streamConnected, setStreamConnected] = useState(false);
  const [busyOverrides, setBusyOverrides] = useState(new Set());
  const [lastScanned, setLastScanned] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Terminal interface states
  const [scanInput, setScanInput] = useState("");
  const [processingScan, setProcessingScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    if (scanning) return;
    if (!branchId) { toast.error("Select a branch first"); return; }
    setScanning(true);
    try {
      const html5Qr = new Html5Qrcode("qr-reader-attendance");
      scannerRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] },
        (decodedText) => {
          handleManualOverrideTrigger(null, null, null, decodedText);
          
          html5Qr.pause(true);
          setTimeout(() => {
            try { html5Qr.resume(); } catch (e) { console.warn("QR resume failed", e); }
          }, 1200);
        },
        () => {} // ignore decode errors
      );
    } catch (err) {
      toast.error("Could not start camera: " + err.message);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch (e) {
      console.warn("Scanner stop failed", e);
    }
    scannerRef.current = null;
    setScanning(false);
  };
  
  const sseConnectionRef = useRef(null);

  // Sync with global branch
  useEffect(() => {
    if (selectedBranchId !== undefined && selectedBranchId !== "") {
      setBranchId(selectedBranchId);
    }
  }, [selectedBranchId]);

  // Fetch baseline static collection matrices
  useEffect(() => {
    erp.listBranches().then(setBranches).catch(() => {});
    erp.listStudents().then(res => setStudents(extractItems(res))).catch(() => {});
  }, []);

  // Sync log archives on mount or center shift
  const fetchHistoricalLogs = useCallback(() => {
    if (!branchId) return;
    erp.listAttendanceLogs({ branch_id: branchId })
      .then(setLogs)
      .catch(e => toast.error(formatError(e) || "Failed to load log metrics"));
  }, [branchId]);

  useEffect(() => {
    fetchHistoricalLogs();
  }, [fetchHistoricalLogs]);

  // ============================================================================
  // SSE BROADCASTER PIPELINE SYNC ENGINE
  // ============================================================================
  const establishLiveStream = useCallback(() => {
    if (!branchId) return;

    if (sseConnectionRef.current) {
      sseConnectionRef.current.close();
    }

    const targetStreamUrl = erp.getAttendanceStreamUrl(branchId);
    const eventSourceInstance = new EventSource(targetStreamUrl, { withCredentials: true });
    sseConnectionRef.current = eventSourceInstance;

    eventSourceInstance.onopen = () => {
      setStreamConnected(true);
    };

    eventSourceInstance.onerror = () => {
      setStreamConnected(false);
    };

    eventSourceInstance.addEventListener("attendance_scanned_event", (e) => {
      try {
        const freshLogDocument = JSON.parse(e.data);
        setLogs(prev => [freshLogDocument, ...prev]);
        setLastScanned(freshLogDocument);
        toast.success(`Check-In Verified: ${freshLogDocument.full_name}`, {
          description: `Status: ${freshLogDocument.status?.toUpperCase()} • Batch: ${freshLogDocument.batch || 'General'}`,
          icon: <CheckCircle2 className="bg-transparent text-emerald-500" />
        });
      } catch (err) {
        console.error("Payload parse error on live context wire:", err);
      }
    });

    return () => {
      eventSourceInstance.close();
      setStreamConnected(false);
    };
  }, [branchId]);

  useEffect(() => {
    const cleanupStream = establishLiveStream();
    return () => {
      if (cleanupStream) cleanupStream();
    };
  }, [establishLiveStream]);

  // ============================================================================
  // HARDWARE TERMINAL INPUT SIMULATION CONTROLLER
  // ============================================================================
  const handleTerminalScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanInput.trim() || processingScan) return;

    setProcessingScan(true);
    try {
      const payload = {
        student_no: scanInput.trim().toUpperCase(),
        device_signature: "CON-DESK-KEYPAD"
      };
      
      const loggedEntry = await erp.submitAttendanceScan(payload);
      setLastScanned(loggedEntry);
      if (!streamConnected) {
        setLogs(prev => [loggedEntry, ...prev]);
        toast.success(`Check-In logged for ${loggedEntry.full_name}`);
      }
      setScanInput("");
    } catch (err) {
      toast.error(formatError(err) || "Scan validation check failed.");
    } finally {
      setProcessingScan(false);
    }
  };

  // ============================================================================
  // MANUAL DESK OVERRIDE LIFE HANDLER
  // ============================================================================
  const handleManualOverrideTrigger = async (studentId, studentName, forcedStatus, scanCode) => {
    if (scanCode) {
      try {
        await erp.submitAttendanceScan({
          student_no: scanCode
        });
        toast.success(`Scanned: ${scanCode}`);
      } catch (e) {
        toast.error(formatError(e) || "Scan error");
      }
      return;
    }

    if (busyOverrides.has(studentId)) return;

    setBusyOverrides(prev => { const next = new Set(prev); next.add(studentId); return next; });
    try {
      await erp.submitManualAttendanceOverride({
        student_id: studentId,
        status: forcedStatus
      });
      toast.success(`Forced override ledger saved: ${studentName} -> ${forcedStatus}`);
    } catch (err) {
      toast.error(formatError(err) || "Override access blocked by system policies.");
    } finally {
      setBusyOverrides(prev => { const next = new Set(prev); next.delete(studentId); return next; });
    }
  };

  const filteredLogs = logs.filter(log => 
    log.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.student_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const buildExcelExportUrl = () => {
  let destinationUrl = `${API_BASE}/erp/erpattendance/exports/attendance_today.xlsx`;
  if (branchId) {
    destinationUrl += `?branch_id=${encodeURIComponent(branchId)}`;
  }
  return destinationUrl;
};

  return (
    <div className="space-y-6 lg:h-[calc(100vh-120px)] min-h-[calc(100vh-120px)] flex flex-col min-h-0 animate-fadeIn relative bg-slate-50 dark:bg-black" data-testid="erp-attendance-page">
      
      {/* UPPER MASTER RUNTIME STATS RIBBON */}
      <div className="flex justify-between items-end flex-wrap gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3"><QrCode size={12}/> Biometric Verification Hub</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">Gate Attendance Terminal</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">Asynchronous monitoring environment. Processing class and batch data segments automatically.</p>
        </div>

        {/* OPERATION CONTROL PACKET LAYOUT */}
        <div className="flex items-center gap-3">
          <a href={buildExcelExportUrl()} target="_blank" rel="noreferrer" className="block">
            <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
              disabled={!branchId}
              className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2"
            >
              <FileDown size={14} className="text-emerald-600" /> Export Today's Excel
            </Button>
          </a>

          <div className={`px-3 py-1.5 border rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-2 transition ${
            streamConnected 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
              : "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse"
          }`}>
            {streamConnected ? (
              <><Wifi size={14} className="animate-pulse" /> STREAM ACTIVE</>
            ) : (
              <><WifiOff size={14} /> STREAM DISCONNECTED</>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD UTILITY ACTION BARS LAYOUT */}
      <div className="grid md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]  md:col-span-2 flex flex-col justify-center">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <Terminal size={13} className="text-teal-800 dark:text-teal-300" /> Manual Entry Keypad Emulator
          </label>
          <div className="flex gap-2 mb-3">
            <Button
              onClick={scanning ? stopScanner : startScanner}
              className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition flex-1 ${
                scanning ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-500/20"
              }`}
            >
              {scanning ? "Stop Camera Scanner" : "Start Camera Scanner"}
            </Button>
          </div>
          <div className={scanning ? "mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-black" : "hidden"}>
            <div id="qr-reader-attendance" className="w-full"></div>
          </div>
          <form onSubmit={handleTerminalScanSubmit} className="flex gap-2">
            <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
              type="text"
              value={scanInput}
              disabled={processingScan || !branchId}
              onChange={e => setScanInput(e.target.value)}
              placeholder={branchId ? "Scan badge barcode or type Enrollment Number (e.g. NES-SRI-0001)..." : "Select an operational branch first..."}
              className="flex-1 px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50"
            />
            <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
              type="submit"
              disabled={processingScan || !scanInput.trim() || !branchId}
              className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2 shrink-0"
            >
              {processingScan ? "Checking..." : "Submit Scan"}
            </Button>
          </form>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]  flex flex-col justify-center">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <Users size={13} className="text-teal-800 dark:text-teal-300"/> Operational Tracking Scope
          </label>
          {isSuper(erpUser) ? (
            <select
              value={branchId}
              onChange={e => { setBranchId(e.target.value); setLogs([]); }}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
            >
              <option value="">— Select Monitoring Station —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          ) : (
            <div className="px-3 py-2 border border-slate-200 dark:border-white/[0.08] bg-slate-200/50 dark:bg-white/[0.04] text-sm text-slate-800 dark:text-zinc-200 rounded-xl font-medium truncate">
              {branches.find(b => b.id === erpUser?.branch_id)?.name || "Assigned Branch Workspace"}
            </div>
          )}
        </div>
      </div>

      {/* RECENT SCAN REAL-TIME VERIFICATION BANNER */}
      {lastScanned && (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4 animate-fadeIn shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold shrink-0">
              <UserCheck size={22} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 truncate">{lastScanned.full_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  lastScanned.status === "present" ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-500"
                }`}>
                  {lastScanned.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                {lastScanned.student_no} • Cohort: {lastScanned.batch || "General"} • Scanned at {fmtDate(lastScanned.scanned_at, true)}
              </div>
            </div>
          </div>
          <Button className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
            onClick={() => setLastScanned(null)} 
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 p-1.5 rounded-lg hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* CORE TRANSACTIONAL SECTION MATRIX LAYOUTS */}
      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] flex flex-col lg:col-span-2 min-h-[500px] lg:min-h-0">
          <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 relative transition-all duration-[350ms]">
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40 flex justify-between items-center shrink-0">
            <div className="font-display font-medium text-lg text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <Clock size={16} className="text-teal-800 dark:text-teal-300"/> Live Gate Check-In Stream
            </div>
            <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter running logs..."
              className="w-48 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
            />
          </div>

          <div className="overflow-y-auto overflow-x-auto w-full h-full custom-scrollbar min-h-0">
            <table className="w-full text-sm table-fixed border-collapse min-w-[550px]">
              <thead className="bg-slate-200/50 dark:bg-white/[0.04]/90 backdrop-blur-md text-slate-500 dark:text-zinc-400 sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                <tr className="text-left">
                  <th className="w-[20%] px-4 py-3 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Reg Code</th>
                  <th className="w-[35%] px-4 py-3 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Student Full Name</th>
                  <th className="w-[25%] px-4 py-3 text-xs font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.04]">Verified Clock</th>
                  <th className="w-[20%] px-4 py-3 text-xs font-bold uppercase tracking-wider text-center bg-slate-200/50 dark:bg-white/[0.04]">Status Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-200/50 dark:bg-white/[0.04]/50 transition-colors bg-slate-50 dark:bg-black/10 animate-slideUp">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold tracking-wide">{log.student_no}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-800 dark:text-zinc-200 truncate" title={log.full_name}>{log.full_name}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-zinc-400 font-mono">{fmtDate(log.scanned_at, true)}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`rounded-[10px] text-[11px] font-semibold px-2.5 py-1 ${
                        log.status === "present"
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20"
                          : (log.status === "absent" ? "bg-red-500/15 text-red-800 dark:text-red-300 border border-rose-300 dark:border-red-500/20" : "bg-yellow-500/15 text-amber-800 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/20")
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-16 text-center text-slate-500 dark:text-zinc-400/60 italic text-xs">
                      {branchId ? "Awaiting terminal handshake scanning logs sequence..." : "Select monitoring target center scope to instantiate telemetry feeds."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[1.75rem] p-[6px] flex flex-col min-h-[400px] lg:min-h-0">
          <div className="bg-white dark:bg-[#111] rounded-[calc(1.75rem-6px)] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden p-5 flex flex-col flex-1 relative transition-all duration-[350ms]">
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40 shrink-0">
            <div className="font-display font-medium text-base text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-teal-800 dark:text-teal-300" /> Desk Override Registry
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed mb-3">
              Force-verify a student directly from the directory if they forgot their printed hardware access cards profile.
            </p>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500 dark:text-zinc-400" />
              <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" 
                type="text" 
                placeholder="Search by name or student ID..." 
                value={overrideSearch}
                onChange={e => setOverrideSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-teal-600/50"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-4 space-y-2.5 flex-1 min-h-0 custom-scrollbar">
            {isManagerPlus(erpUser) ? (
              students
                .filter(s => s.branch_id === branchId && s.status === "active" && (!overrideSearch || (s.full_name || "").toLowerCase().includes(overrideSearch.toLowerCase()) || (s.student_no || "").toLowerCase().includes(overrideSearch.toLowerCase())))
                .map(st => (
                  <div key={st.id} className="p-3 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-200 dark:border-white/[0.08] transition">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{st.full_name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400/60 font-mono mt-0.5">{st.student_no}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        disabled={busyOverrides.has(st.id)}
                        onClick={() => handleManualOverrideTrigger(st.id, st.full_name, "present")}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-30"
                      >
                        Present
                      </Button>
                      <Button
                        disabled={busyOverrides.has(st.id)}
                        onClick={() => handleManualOverrideTrigger(st.id, st.full_name, "late")}
                        className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-800 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-30"
                      >
                        Late
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 text-slate-500 dark:text-zinc-400 italic text-xs">
                <AlertCircle size={24} className="text-slate-500 dark:text-zinc-400/30 mb-2" />
                Administrative credentials verification required to access localized floor override parameters.
              </div>
            )}
            {branchId && students.filter(s => s.branch_id === branchId && s.status === "active").length === 0 && (
              <div className="text-center text-xs text-slate-500 dark:text-zinc-400 italic py-8">
                No active student assets found registered to this center layout branch context.
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

    </div>
  );
}