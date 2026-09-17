import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Shield, Cpu, Activity, Zap, Layers, Maximize, Settings, LogOut, Search, Bell, Monitor, Droplet, Box, Layers as LayersIcon } from 'lucide-react';

export default function DesignPlayground() {
  const [theme, setTheme] = useState('glass'); // glass, neumorphic, clay, skeuomorphic, flat
  const [activeTab, setActiveTab] = useState("overview");
  
  const themes = [
    { id: 'glass', name: 'Glassmorphism', icon: Droplet },
    { id: 'neumorphic', name: 'Neumorphism', icon: Monitor },
    { id: 'clay', name: 'Claymorphism', icon: Box },
    { id: 'skeuomorphic', name: 'Skeuomorphism', icon: LayersIcon },
    { id: 'flat', name: 'Flat 2.0 + Clay', icon: Layers }
  ];

  const stats = [
    { title: "Network Latency", val: "12ms", diff: "-2ms", status: "good" },
    { title: "Active Connections", val: "1,248", diff: "+14%", status: "good" },
    { title: "Memory Heap", val: "4.2 GB", diff: "+0.8 GB", status: "warn" },
    { title: "Threat Blocks", val: "84", diff: "Normal", status: "good" }
  ];

  const renderContent = () => {
    switch(theme) {
      case 'glass': return <GlassTheme stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'neumorphic': return <NeumorphicTheme stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'clay': return <ClayTheme stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'skeuomorphic': return <SkeuomorphicTheme stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'flat': return <FlatTheme stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Universal Theme Selector Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-center gap-2 sm:gap-4 px-4 shrink-0 z-[100] relative text-white">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4 hidden md:inline">Select UI Paradigm:</span>
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === t.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>
      
      {/* Theme Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 1. GLASSMORPHISM (Spatial UI)
// ---------------------------------------------------------
function GlassTheme({ stats, activeTab, setActiveTab }) {
  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex items-center justify-center absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      
      <div className="relative w-full max-w-5xl h-[80vh] rounded-[2.5rem] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 bg-white/[0.02] backdrop-blur-[40px] z-10 overflow-hidden">
        <header className="h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-8">
          <h1 className="text-xl font-medium tracking-wide">GlassOS</h1>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {["overview", "analytics"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </header>
        <div className="flex-1 p-8 grid grid-cols-2 gap-6 overflow-y-auto">
          {stats.map((s, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-all relative overflow-hidden group">
              <div className="text-sm font-medium text-slate-400 mb-2">{s.title}</div>
              <div className="text-4xl font-light text-white mb-2">{s.val}</div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 2. NEUMORPHISM (Soft UI)
// ---------------------------------------------------------
function NeumorphicTheme({ stats, activeTab, setActiveTab }) {
  // Classic Neumorphism: light gray bg, soft light top-left, dark shadow bottom-right
  return (
    <div className="w-full h-full bg-[#e0e5ec] text-[#4a5568] flex items-center justify-center absolute inset-0">
      <div className="w-full max-w-5xl h-[80vh] rounded-[2.5rem] flex flex-col bg-[#e0e5ec] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] overflow-hidden">
        <header className="h-20 shrink-0 flex items-center justify-between px-8 border-b border-white/20">
          <h1 className="text-xl font-bold tracking-wide text-slate-600">SoftUI</h1>
          <div className="flex gap-4">
            {["overview", "analytics"].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-6 py-2 rounded-2xl text-sm font-bold capitalize transition-all ${
                  activeTab === t 
                  ? 'shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-indigo-500' 
                  : 'shadow-[4px_4px_8px_rgb(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.5)] hover:text-indigo-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>
        <div className="flex-1 p-8 grid grid-cols-2 gap-8 overflow-y-auto">
          {stats.map((s, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#e0e5ec] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] flex flex-col justify-center">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{s.title}</div>
              <div className="text-4xl font-extrabold text-slate-700">{s.val}</div>
            </div>
          ))}
          <div className="col-span-2 h-40 rounded-3xl bg-[#e0e5ec] shadow-[inset_6px_6px_12px_rgb(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)] flex items-center justify-center p-6">
             <div className="w-full h-full rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_rgb(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 3. CLAYMORPHISM
// ---------------------------------------------------------
function ClayTheme({ stats, activeTab, setActiveTab }) {
  // Claymorphism: pastel bg, fluffy 3D shapes (inner shadow + outer shadow)
  return (
    <div className="w-full h-full bg-[#f1f3f9] text-[#333] flex items-center justify-center absolute inset-0">
      <div className="w-full max-w-5xl h-[80vh] rounded-[3rem] flex flex-col bg-[#f5f7fa] overflow-hidden shadow-[35px_35px_68px_#d1d5df,-35px_-35px_68px_#ffffff,inset_-8px_-8px_16px_rgba(0,0,0,0.05),inset_8px_8px_16px_rgba(255,255,255,0.8)]">
        <header className="h-24 shrink-0 flex items-center justify-between px-10">
          <h1 className="text-2xl font-black tracking-tight text-slate-700">Clay<span className="text-rose-400">OS</span></h1>
          <div className="flex gap-4">
            {["overview", "analytics"].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-8 py-3 rounded-full text-sm font-bold capitalize transition-all ${
                  activeTab === t 
                  ? 'bg-rose-400 text-white shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.15),inset_4px_4px_8px_rgba(255,255,255,0.4)]' 
                  : 'bg-white text-slate-500 shadow-[8px_8px_16px_#d1d5df,-8px_-8px_16px_#ffffff,inset_-4px_-4px_8px_rgba(0,0,0,0.02),inset_4px_4px_8px_rgba(255,255,255,1)] hover:-translate-y-1'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>
        <div className="flex-1 p-10 grid grid-cols-2 gap-8 overflow-y-auto">
          {stats.map((s, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white flex flex-col justify-center shadow-[16px_16px_32px_#d1d5df,-16px_-16px_32px_#ffffff,inset_-6px_-6px_12px_rgba(0,0,0,0.03),inset_6px_6px_12px_rgba(255,255,255,1)] transition-transform hover:scale-[1.02]">
              <div className="text-sm font-bold text-slate-400 mb-2">{s.title}</div>
              <div className="text-5xl font-black text-slate-700">{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 4. SKEUOMORPHISM
// ---------------------------------------------------------
function SkeuomorphicTheme({ stats, activeTab, setActiveTab }) {
  // Realistic textures, heavy bevels, drop shadows.
  return (
    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#3e2723] text-[#fff] flex items-center justify-center absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
      <div className="w-full max-w-5xl h-[80vh] rounded-xl flex flex-col bg-[#d7ccc8] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.8)] border-[8px] border-[#5d4037]">
        <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-gradient-to-b from-[#efebe9] to-[#d7ccc8] shadow-[0_4px_6px_rgba(0,0,0,0.3)] z-10 border-b border-[#a1887f]">
          <h1 className="text-xl font-serif font-bold text-[#3e2723] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">Skeuo Panel</h1>
          <div className="flex gap-3">
            {["overview", "analytics"].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-6 py-1.5 rounded text-sm font-bold font-serif capitalize transition-all border border-[#5d4037] ${
                  activeTab === t 
                  ? 'bg-gradient-to-t from-[#8d6e63] to-[#a1887f] text-white shadow-[inset_0_3px_5px_rgba(0,0,0,0.6)]' 
                  : 'bg-gradient-to-b from-[#ffffff] to-[#d7ccc8] text-[#3e2723] shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,1)] hover:brightness-110'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>
        <div className="flex-1 p-8 grid grid-cols-2 gap-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/leather.png')] bg-[#795548] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
          {stats.map((s, i) => (
            <div key={i} className="p-6 rounded-lg bg-gradient-to-b from-[#eceff1] to-[#cfd8dc] border-2 border-[#b0bec5] flex flex-col justify-center shadow-[0_10px_15px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.9)]">
              <div className="text-xs font-serif font-bold text-[#455a64] uppercase tracking-wider mb-2 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">{s.title}</div>
              <div className="text-4xl font-serif font-black text-[#263238] drop-shadow-[0_2px_1px_rgba(255,255,255,0.8)]">{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 5. FLAT DESIGN 2.0 (Semi-Flat + Subtle Clay)
// ---------------------------------------------------------
function FlatTheme({ stats, activeTab, setActiveTab }) {
  // Bold solid colors, crisp borders, solid offset shadows or very soft large shadows
  return (
    <div className="w-full h-full bg-[#fce4ec] text-[#1e293b] flex items-center justify-center absolute inset-0">
      <div className="w-full max-w-5xl h-[80vh] rounded-[2rem] flex flex-col bg-white overflow-hidden border-4 border-[#1e293b] shadow-[12px_12px_0_#1e293b]">
        <header className="h-24 shrink-0 flex items-center justify-between px-8 border-b-4 border-[#1e293b] bg-[#f8fafc]">
          <h1 className="text-2xl font-black tracking-tight text-[#1e293b]">Flat 2.0</h1>
          <div className="flex gap-4">
            {["overview", "analytics"].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border-2 border-[#1e293b] ${
                  activeTab === t 
                  ? 'bg-[#1e293b] text-white shadow-[4px_4px_0_#94a3b8]' 
                  : 'bg-white text-[#1e293b] shadow-[4px_4px_0_#1e293b] hover:-translate-y-1 hover:shadow-[6px_6px_0_#1e293b]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>
        <div className="flex-1 p-8 grid grid-cols-2 gap-8 overflow-y-auto bg-[#f8fafc]">
          {stats.map((s, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#fbbf24] border-4 border-[#1e293b] flex flex-col justify-center shadow-[8px_8px_0_#1e293b] hover:-translate-y-2 hover:shadow-[12px_12px_0_#1e293b] transition-all">
              <div className="text-sm font-bold text-[#1e293b] uppercase tracking-black mb-2">{s.title}</div>
              <div className="text-5xl font-black text-[#1e293b]">{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

