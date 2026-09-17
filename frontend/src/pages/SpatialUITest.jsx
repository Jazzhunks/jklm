import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Shield, Cpu, Activity, Zap, Layers, Maximize, Settings, LogOut, ChevronRight, Bell, Search, User } from 'lucide-react';

export default function SpatialUITest() {
  const [activeTab, setActiveTab] = useState("overview");
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-slate-950 font-sans text-slate-100 flex items-center justify-center p-4 sm:p-8">
      {/* Background Orbs for Spatial Depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/20 rounded-full blur-[90px] mix-blend-screen" />

      {/* Main Spatial Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 bg-black/20 backdrop-blur-[40px] z-10"
      >
        {/* Spatial Top Bar */}
        <header className="h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-8 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Layers className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-medium tracking-wide">Spatial Admin</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">VisionOS Protocol</p>
            </div>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            {["overview", "analytics", "security", "system"].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${activeTab === t ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Search size={18} className="text-slate-300" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative">
              <Bell size={18} className="text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/20 overflow-hidden ml-2 shadow-lg">
               <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="admin" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Spatial Content Area */}
        <main className="flex-1 flex overflow-hidden relative z-10">
          
          {/* Left Sidebar (Glass Context Menu) */}
          <div className="w-64 border-r border-white/5 p-6 flex flex-col gap-2 shrink-0 overflow-y-auto">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 ml-2">Controls</div>
            {[
              { icon: Activity, label: "Live Traffic" },
              { icon: Shield, label: "Threat Matrix" },
              { icon: Cpu, label: "Core Processing" },
              { icon: Zap, label: "Performance" }
            ].map((item, i) => (
              <button key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors text-left group">
                <item.icon size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
              </button>
            ))}
            
            <div className="mt-auto space-y-2">
              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors text-left w-full">
                <Settings size={18} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Preferences</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-500/20 transition-colors text-left w-full group">
                <LogOut size={18} className="text-slate-400 group-hover:text-rose-400" />
                <span className="text-sm font-medium text-slate-300 group-hover:text-rose-400">Exit Spatial</span>
              </button>
            </div>
          </div>

          {/* Main Viewport */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-light tracking-tight text-white mb-2">System <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400 capitalize">{activeTab}</span></h2>
                    <p className="text-slate-400 text-sm">Real-time spatial telemetry and intelligence.</p>
                  </div>
                  <button onClick={() => setPanelOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all text-sm font-medium shadow-xl">
                    <Maximize size={16} /> Inspect Node
                  </button>
                </div>

                {/* Spatial Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Network Latency", val: "12ms", diff: "-2ms", status: "good" },
                    { title: "Active Connections", val: "1,248", diff: "+14%", status: "good" },
                    { title: "Memory Heap", val: "4.2 GB", diff: "+0.8 GB", status: "warn" },
                    { title: "Threat Blocks", val: "84", diff: "Normal", status: "good" },
                    { title: "Database Load", val: "42%", diff: "-5%", status: "good" },
                    { title: "Cluster Status", val: "Healthy", diff: "All Nodes Up", status: "good" },
                  ].map((stat, i) => (
                    <div key={i} className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 overflow-hidden cursor-default">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10">
                        <div className="text-sm font-medium text-slate-400 mb-4">{stat.title}</div>
                        <div className="text-4xl font-light tracking-tight text-white mb-2">{stat.val}</div>
                        <div className={`text-xs font-medium px-2 py-1 inline-flex rounded-md bg-black/40 backdrop-blur-md border ${stat.status === 'warn' ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                          {stat.diff}
                        </div>
                      </div>
                      
                      {/* Decorative internal elements */}
                      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
                    </div>
                  ))}
                </div>

                {/* Large Chart/Data Area */}
                <div className="w-full h-80 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 mt-8 p-6 relative overflow-hidden flex flex-col">
                   <div className="text-sm font-medium text-slate-300 mb-6 flex justify-between items-center">
                     <span>Throughput Timeline</span>
                     <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                       <span className="text-[10px] text-indigo-400 tracking-widest uppercase">Live</span>
                     </div>
                   </div>
                   
                   {/* Fake Chart Lines using CSS */}
                   <div className="flex-1 relative flex items-end justify-between gap-2 px-2 pb-2">
                     {[...Array(24)].map((_, i) => {
                       const h = 20 + Math.random() * 80;
                       return (
                         <div key={i} className="w-full bg-indigo-500/20 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                            <div className="absolute bottom-0 left-0 w-full bg-indigo-400/80 transition-all duration-500" style={{ height: '0%', top: '100%' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/40 to-teal-400/80 opacity-50 group-hover:opacity-100 transition-opacity" />
                         </div>
                       )
                     })}
                   </div>
                   {/* Glass scanline effect */}
                   <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px]" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Floating Context Panel (Simulating Z-Depth) */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-6 bottom-6 right-6 w-96 bg-black/40 backdrop-blur-[60px] border border-white/20 rounded-[2rem] shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                    <Cpu size={18} className="text-teal-400" />
                  </div>
                  <h3 className="font-medium text-lg text-white">Node Inspector</h3>
                </div>
                <button onClick={() => setPanelOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X size={16} className="text-slate-300" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Node Details</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ID</span>
                    <span className="font-mono text-slate-200">ND-8X42-F</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Location</span>
                    <span className="text-slate-200">us-east-1a</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Active</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Process Log</div>
                  <div className="space-y-2 font-mono text-[10px] text-slate-400">
                    <div className="truncate text-teal-400">] Auth sequence initiated</div>
                    <div className="truncate">] Handshake accepted</div>
                    <div className="truncate text-rose-400">] Packet loss detected (0.01%)</div>
                    <div className="truncate">] Re-routing traffic via proxy-2</div>
                    <div className="truncate text-teal-400">] Connection stabilized</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Initiate Diagnostic
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
