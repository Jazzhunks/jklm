import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { erp, isSuper, isManagerPlus, isERPUser } from "@/lib/erpApi";
import ErpCommandPalette from "./ErpCommandPalette";
import ProfileModal from "./modals/ProfileModal";
import {
  LayoutDashboard, Users, Receipt, Wallet, UserPlus, Building2,
  ScrollText, LogOut, Menu, X, GraduationCap, Contact2, QrCode, MessageSquare,
  Search, Bell, UserCog, ChevronRight, Clock, Plus, Shield, Sun, Moon
} from "lucide-react";

const NAV = [
  { group: "Executive" },
  { to: "/erp", label: "Executive Dashboard", icon: LayoutDashboard, exact: true, show: (u) => u.role !== "attendance" },
  { group: "Enrollment & CRM" },
  { to: "/erp/leads", label: "Prospect Leads", icon: UserPlus, show: (u) => ["super_admin", "admin", "center_manager", "accountant", "counsellor"].includes(u.role) },
  { to: "/erp/students", label: "Student Roster", icon: GraduationCap, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { group: "Treasury & Operations" },
  { to: "/erp/payments", label: "Financial Ledgers", icon: Receipt, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/expenses", label: "Expense Sheets", icon: Wallet, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/branches", label: "Branch Architecture", icon: Building2, show: (u) => isSuper(u) },
  { to: "/erp/staff", label: "Staff Directory", icon: Users, show: (u) => ["super_admin", "admin", "center_manager"].includes(u.role) },
  { group: "Campus & Security" },
  { to: "/erp/attendance", label: "Gate Attendance", icon: QrCode, show: (u) => ["super_admin", "admin", "center_manager", "attendance"].includes(u.role) },
  { to: "/erp/id-cards", label: "Identity Cards", icon: Contact2, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/audit", label: "System Audit", icon: ScrollText, show: (u) => isSuper(u) },
  { group: "Communications" },
  { to: "/erp/whatsapp", label: "WhatsApp Nexus", icon: MessageSquare, show: (u) => isSuper(u) },
];


const DEFAULT_CLASSES = ["Biggner (8th)", "Adapt (9th)", "Elivate (10th)", "Triumph (11th)", "Zenith (12th)", "12th Pass"];
const DEFAULT_COURSES = ["Foundation", "Medical (PCB)", "Non-Medical (PCM)", "Commerce", "Arts/Humanities", "IIT JEE", "NEET UG", "Test Series"];

export default function ErpLayout() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [erpUser, setErpUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [academicConfig, setAcademicConfig] = useState({ classes: DEFAULT_CLASSES, courses: DEFAULT_COURSES, matrix: {} });

  const [theme, setTheme] = useState(localStorage.getItem('erp-theme') || 'dark');


  const { data: alertsData } = useQuery({
    queryKey: ["erpAlerts"],
    queryFn: () => erp.getAlerts(),
    refetchInterval: 15000,
    enabled: !!erpUser
  });
  const alerts = alertsData?.alerts || [];
  const unreadCount = alerts.length;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('erp-theme', theme);
  }, [theme]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [err, setErr] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (loading) return;
    if (!user) { nav("/login?next=/erp"); return; }
    if (!isERPUser(user)) { setErr("not-erp"); return; }
    erp.me().then(u => {
      setErpUser(u);
      if (u.branch_id) setSelectedBranchId(u.branch_id);
    }).catch(() => setErr("not-erp"));
  }, [user, loading, nav]);

  useEffect(() => {
    if (erpUser && isSuper(erpUser)) {
      erp.listBranches().then(setBranches).catch(() => {});
    }
  }, [erpUser]);

  // Redirect gatekeeper away from root dashboard
  useEffect(() => {
    if (erpUser?.role === "attendance" && location.pathname === "/erp") {
      nav("/erp/attendance", { replace: true });
    }
  }, [erpUser, location.pathname, nav]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Breadcrumbs generator
  const breadcrumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return [{ label: "Executive Dashboard", to: "/erp" }];
    
    const trail = [{ label: "ERP", to: "/erp" }];
    if (parts[1] === "students") {
      trail.push({ label: "Students", to: "/erp/students" });
      if (parts[2]) trail.push({ label: `Dossier #${parts[2]}`, to: location.pathname });
    } else if (parts[1] === "payments") {
      trail.push({ label: "Fee Collections", to: "/erp/payments" });
    } else if (parts[1] === "expenses") {
      trail.push({ label: "Expenses", to: "/erp/expenses" });
    } else if (parts[1] === "leads") {
      trail.push({ label: "Leads", to: "/erp/leads" });
    } else if (parts[1] === "staff") {
      trail.push({ label: "Staff", to: "/erp/staff" });
    } else if (parts[1] === "branches") {
      trail.push({ label: "Branches", to: "/erp/branches" });
    } else if (parts[1] === "attendance") {
      trail.push({ label: "Gate Attendance", to: "/erp/attendance" });
    } else if (parts[1] === "id-cards") {
      trail.push({ label: "ID Cards", to: "/erp/id-cards" });
    } else if (parts[1] === "whatsapp") {
      trail.push({ label: "WhatsApp Broadcast", to: "/erp/whatsapp" });
    } else if (parts[1] === "audit") {
      trail.push({ label: "Audit Ledger", to: "/erp/audit" });
    } else {
      trail.push({ label: parts[1], to: location.pathname });
    }
    return trail;
  }, [location.pathname]);

  if (err === "not-erp") {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-slate-50 dark:bg-black" data-testid="erp-no-access">
        <div className="text-center max-w-md clay-card p-8">
          <div className="text-xs uppercase tracking-widest font-bold text-teal-800 dark:text-teal-300 mb-2">Access Denied</div>
          <h2 className="font-display text-2xl font-bold mb-3 text-slate-800 dark:text-zinc-200">ERP Staff Portal Only</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Your logged in account does not have active ERP staff clearance.</p>
          <Button onClick={() => { logout(); nav("/login?next=/erp"); }} className="w-full bg-transparent rounded-full flex justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 clay-btn-primary" data-testid="erp-relogin-btn">Switch Account</Button>
        </div>
      </div>
    );
  }

  if (!erpUser) return <div className="min-h-screen grid place-items-center text-sm font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-black">Loading ERP Portal…</div>;

  const navItems = NAV.filter(n => typeof n.show === 'function' ? n.show(erpUser) : true);

  return (
    <div className="h-screen w-screen flex bg-slate-50 dark:bg-black font-[\'Geist\',system-ui,sans-serif] text-slate-800 dark:text-zinc-200 overflow-hidden select-none print-layout-override">
      <style>{`
        @media print {
          .print-layout-override {
            height: auto !important;
            width: auto !important;
            overflow: visible !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Global Command Palette */}
      <ErpCommandPalette 
        isOpen={paletteOpen} 
        onClose={() => setPaletteOpen(false)} 
        onAction={(action) => {
          if (action === "new_admission") nav("/erp/admission");
          else if (action === "new_payment") nav("/erp/payments?action=new");
          else if (action === "new_expense") nav("/erp/expenses?action=new");
          else if (action === "new_lead") nav("/erp/leads?action=new");
        }}
        erpUser={erpUser}
      />

      {/* Mobile Drawer Overlay Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Fixed Enterprise Sidebar */}
      <aside 
        className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 h-full bg-white dark:bg-[#111] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between transition-transform duration-200 shrink-0 shadow-sm print:hidden`}
        data-testid="erp-sidebar"
      >
        <div className="w-full shrink-0 flex flex-col">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 bg-teal-600 rounded-[8px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <div className="font-semibold text-[13px] text-slate-900 dark:text-zinc-100">Northend ERP</div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-slate-400 dark:text-zinc-600 uppercase mt-0.5">Enterprise Core</div>
            </div>
          </div>
          
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar min-h-0">
          {navItems.map((item, idx) => {
            if (item.group) {
              return <div key={`group-${idx}`} className="text-[9px] font-semibold tracking-[0.18em] uppercase text-zinc-700 px-3 py-2 mt-4 first:mt-0">{item.group}</div>;
            }
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.exact}
                onClick={() => setOpen(false)}
                data-testid={`erp-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) => `flex items-center gap-[10px] px-3 py-[9px] rounded-[10px] text-[13px] transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? "bg-teal-100 dark:bg-teal-600/15 text-teal-800 dark:text-teal-300 font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:bg-white/5 hover:text-slate-800 dark:text-zinc-200 group"
                }`}
              >
                <item.icon size={16} className="shrink-0" /> <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Bar with Quick Search Trigger & Signout */}
        <div className="p-3 border-t border-slate-200 dark:border-white/[0.06] shrink-0 space-y-1.5">
          <button 
            onClick={() => { setProfileModalOpen(true); setOpen(false); }}
            className="w-full text-left bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.06] rounded-[10px] p-3 flex items-center gap-3 mb-2 transition-all cursor-pointer group"
          >
             <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 group-hover:scale-105 transition-transform">
               {erpUser.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
               <div className="font-semibold text-[13px] text-slate-900 dark:text-zinc-100 truncate" data-testid="erp-user-name">{erpUser.name}</div>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500" data-testid="erp-user-role">
                   {erpUser.role?.replace("_", " ")}
                 </span>
                 {erpUser.branch && (
                   <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                     {erpUser.branch.name}
                   </span>
                 )}
               </div>
             </div>
             <div className="text-slate-400 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
               <UserCog size={14} />
             </div>
          </button>
          
          <div className="flex gap-1.5">
            <Button className="flex-1 bg-transparent rounded-lg flex justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-0 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>} <span className="ml-1.5">Theme</span>
            </Button>
            <Button className="flex-1 bg-transparent rounded-lg flex justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-0 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
              onClick={async () => { await logout(); nav("/login"); }}
              data-testid="erp-logout-btn"
            >
              <LogOut size={14}/> <span className="ml-1.5">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden print:overflow-visible print:h-auto z-10">
        {/* Modern Enterprise Header Bar */}
        <header className="flex items-center justify-between h-14 px-6 sm:px-8 bg-slate-100 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.06] sticky top-0 z-40 shrink-0 print:hidden">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Button className="w-full bg-transparent rounded-full flex justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300" 
              onClick={() => setOpen(o => !o)} 
              aria-label="menu" 
              className="lg:hidden text-slate-800 dark:text-zinc-200 p-1.5 hover:bg-slate-200/50 dark:bg-white/[0.04]/50 rounded-lg transition shrink-0" 
              data-testid="erp-menu-toggle"
            >
              {open ? <X size={20}/> : <Menu size={20}/>}
            </Button>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 overflow-hidden whitespace-nowrap font-medium">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.to} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-slate-400 dark:text-zinc-600 shrink-0" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{crumb.label}</span>
                  ) : (
                    <NavLink to={crumb.to} className="hover:text-slate-800 dark:text-zinc-200 transition">{crumb.label}</NavLink>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Right: Branch Context Selector, Global Search, Bell, UserCog, Live Clock, and Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Super Admin Global Branch Context Switcher */}
            {isSuper(erpUser) && branches.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-200/50 dark:bg-white/[0.04]/40 border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1 text-xs">
                <Building2 size={13} className="text-teal-800 dark:text-teal-300" />
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="bg-transparent border-0 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-0 cursor-pointer pr-1"
                  data-testid="global-branch-switcher"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            
            {/* Notifications */}
            <div className="relative">
              <Button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-transparent flex justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] p-2 h-9 w-9 items-center rounded-full transition-all duration-300"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-black">
                    {unreadCount}
                  </span>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Notifications</span>
                    <span className="text-[10px] font-semibold bg-teal-600/10 text-teal-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">You're all caught up!</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {alerts.map(a => (
                          <div key={a.id} onClick={() => { setShowNotifications(false); nav(a.link || "/erp"); }} className="p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors group">
                            <p className="text-[13px] font-medium text-slate-900 dark:text-zinc-100 mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{a.title}</p>
                            <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-snug">{a.message}</p>
                            <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 mt-2 block">{new Date(a.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search Button (Desktop) */}
            <Button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-200/50 dark:bg-white/[0.04]/40 hover:bg-slate-200/50 dark:bg-white/[0.04]/80 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 transition"
              data-testid="global-search-trigger"
            >
              <Search size={13} />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono bg-white dark:bg-[#111] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">⌘K</kbd>
            </Button>

            {/* Live Clock (Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-mono bg-slate-200/50 dark:bg-white/[0.04]/30 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/[0.08]/50">
              <Clock size={12} className="text-accent" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {/* Fast Quick Actions */}
            {erpUser.role !== "counsellor" && (
              <Button
                onClick={() => nav("/erp/admission")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-600/90 shadow-sm transition"
                data-testid="header-new-admission-btn"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Admission</span>
              </Button>
            )}
          </div>
        </header>

        {/* Dynamic Route Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black p-7 w-full mx-auto relative custom-scrollbar print:p-0 print:h-auto print:overflow-visible">
          <Outlet context={{ erpUser, selectedBranchId, setSelectedBranchId, academicConfig, refreshAcademicConfig: async () => { const f = await erp.getFeeMatrix(); setAcademicConfig({ classes: f.classes?.length ? f.classes : DEFAULT_CLASSES, courses: f.courses?.length ? f.courses : DEFAULT_COURSES, matrix: f.matrix || {} }); }, openCommandPalette: () => setPaletteOpen(true) }} />
          {profileModalOpen && <ProfileModal onClose={() => setProfileModalOpen(false)} />}
        </main>
      </div>
    </div>
  );
}