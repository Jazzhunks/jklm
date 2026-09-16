import { useEffect, useState, useMemo } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { erp, isSuper, isManagerPlus, isERPUser } from "@/lib/erpApi";
import ErpCommandPalette from "./ErpCommandPalette";
import {
  LayoutDashboard, Users, Receipt, Wallet, UserPlus, Building2,
  ScrollText, LogOut, Menu, X, GraduationCap, Contact2, QrCode, MessageSquare,
  Search, UserCog, ChevronRight, Clock, Plus, Shield
} from "lucide-react";

const NAV = [
  { to: "/erp", label: "Dashboard", icon: LayoutDashboard, exact: true, show: (u) => u.role !== "attendance" },
  { to: "/erp/students", label: "Students", icon: GraduationCap, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/payments", label: "Fee Collections", icon: Receipt, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/expenses", label: "Expenses", icon: Wallet, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/leads", label: "Leads", icon: UserPlus, show: (u) => ["super_admin", "admin", "center_manager", "accountant", "counsellor"].includes(u.role) },
  { to: "/erp/staff", label: "Staff", icon: Users, show: (u) => ["super_admin", "admin", "center_manager"].includes(u.role) },
  { to: "/erp/branches", label: "Branches", icon: Building2, show: (u) => isSuper(u) },
  { to: "/erp/audit", label: "Audit Log", icon: ScrollText, show: (u) => isSuper(u) },
  { to: "/erp/erpattendance", label: "Gate Attendance", icon: QrCode, show: (u) => ["super_admin", "admin", "center_manager", "attendance"].includes(u.role) },
  { to: "/erp/erpidcards", label: "ID Cards", icon: Contact2, show: (u) => ["super_admin", "admin", "center_manager", "accountant"].includes(u.role) },
  { to: "/erp/whatsapp", label: "WhatsApp Broadcast", icon: MessageSquare, show: (u) => isSuper(u) },
];

export default function ErpLayout() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [erpUser, setErpUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
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
      nav("/erp/erpattendance", { replace: true });
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
    } else if (parts[1] === "erpattendance") {
      trail.push({ label: "Gate Attendance", to: "/erp/erpattendance" });
    } else if (parts[1] === "erpidcards") {
      trail.push({ label: "ID Cards", to: "/erp/erpidcards" });
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
      <div className="min-h-screen grid place-items-center p-6 bg-background" data-testid="erp-no-access">
        <div className="text-center max-w-md clay-card p-8">
          <div className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Access Denied</div>
          <h2 className="font-display text-2xl font-bold mb-3 text-foreground">ERP Staff Portal Only</h2>
          <p className="text-sm text-muted-foreground mb-6">Your logged in account does not have active ERP staff clearance.</p>
          <button onClick={() => { logout(); nav("/login?next=/erp"); }} className="clay-btn-primary" data-testid="erp-relogin-btn">Switch Account</button>
        </div>
      </div>
    );
  }

  if (!erpUser) return <div className="min-h-screen grid place-items-center text-sm font-semibold text-muted-foreground bg-background">Loading ERP Portal…</div>;

  const navItems = NAV.filter(n => n.show(erpUser));

  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden select-none print-layout-override">
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
          if (action === "new_admission") nav("/erp/students?action=new");
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
        className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 h-full bg-card border-r border-border flex flex-col justify-between transition-transform duration-200 shrink-0 shadow-sm print:hidden`}
        data-testid="erp-sidebar"
      >
        <div className="w-full shrink-0 flex flex-col">
          {/* Brand Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Northend Edu</span>
              </div>
              <div className="font-display text-xl font-bold tracking-tight mt-0.5 text-foreground">ERP Console</div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-primary/10 text-primary border border-primary/20">
              v2.4 Pro
            </span>
          </div>
          
          {/* User Profile Card */}
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active Staff</div>
              <span className="text-[10px] font-mono text-emerald-500 font-semibold">Online</span>
            </div>
            <div className="font-semibold mt-0.5 text-xs text-foreground truncate" data-testid="erp-user-name">{erpUser.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-primary/10 text-primary rounded border border-primary/20" data-testid="erp-user-role">
                {erpUser.role?.replace("_", " ")}
              </span>
              {erpUser.branch && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  📍 {erpUser.branch.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Item Track */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar min-h-0">
          {navItems.map(item => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.exact}
              onClick={() => setOpen(false)}
              data-testid={`erp-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon size={16} className="shrink-0" /> <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Bar with Quick Search Trigger & Signout */}
        <div className="p-3 border-t border-border shrink-0 bg-muted/30 space-y-1.5">
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground bg-background border border-border hover:text-foreground hover:border-accent/40 transition"
          >
            <span className="flex items-center gap-2">
              <Search size={14} /> Quick Search
            </span>
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>
          <button 
            onClick={() => { setProfileModalOpen(true); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition duration-150"
          >
            <UserCog size={16} className="shrink-0"/> <span>Profile & Settings</span>
          </button>
          <button 
            onClick={async () => { await logout(); nav("/login"); }}
            data-testid="erp-logout-btn"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition duration-150"
          >
            <LogOut size={16} className="shrink-0"/> <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden print:overflow-visible print:h-auto">
        {/* Modern Enterprise Header Bar */}
        <header className="flex items-center justify-between px-4 py-2.5 sm:px-6 bg-card border-b border-border sticky top-0 z-20 shrink-0 print:hidden">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setOpen(o => !o)} 
              aria-label="menu" 
              className="lg:hidden text-foreground p-1.5 hover:bg-muted/50 rounded-lg transition shrink-0" 
              data-testid="erp-menu-toggle"
            >
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden whitespace-nowrap">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.to} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-foreground truncate">{crumb.label}</span>
                  ) : (
                    <NavLink to={crumb.to} className="hover:text-foreground transition">{crumb.label}</NavLink>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Right: Branch Context Selector, Global Search, UserCog, Live Clock, and Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Super Admin Global Branch Context Switcher */}
            {isSuper(erpUser) && branches.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-muted/40 border border-border rounded-xl px-2.5 py-1 text-xs">
                <Building2 size={13} className="text-primary" />
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="bg-transparent border-0 text-xs font-semibold text-foreground focus:outline-none focus:ring-0 cursor-pointer pr-1"
                  data-testid="global-branch-switcher"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Search Button (Desktop) */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/40 hover:bg-muted/80 border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground transition"
              data-testid="global-search-trigger"
            >
              <Search size={13} />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
            </button>

            {/* Live Clock (Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/30 px-2.5 py-1 rounded-xl border border-border/50">
              <Clock size={12} className="text-accent" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {/* Fast Quick Actions */}
            {erpUser.role !== "counsellor" && (
              <button
                onClick={() => nav("/erp/students?action=new")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-sm transition"
                data-testid="header-new-admission-btn"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Admission</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Route Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative custom-scrollbar print:p-0 print:h-auto print:overflow-visible">
          <Outlet context={{ erpUser, selectedBranchId, setSelectedBranchId, openCommandPalette: () => setPaletteOpen(true) }} />
          {profileModalOpen && <ProfileModal onClose={() => setProfileModalOpen(false)} />}
        </main>
      </div>
    </div>
  );
}