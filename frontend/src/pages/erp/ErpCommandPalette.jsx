import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { erp } from "@/lib/erpApi";
import { 
  Search, LayoutDashboard, GraduationCap, Receipt, Wallet, 
  UserPlus, QrCode, Contact2, Users, Building2, MessageSquare, 
  ScrollText, ArrowRight, CornerDownLeft, Sparkles, User, X
} from "lucide-react";

export default function ErpCommandPalette({ isOpen, onClose, onAction, erpUser }) {
  const [query, setQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const nav = useNavigate();

  // Navigation catalog
  const pages = [
    { label: "Executive Dashboard", path: "/erp", icon: LayoutDashboard, category: "Navigation", show: true },
    { label: "Student Directory", path: "/erp/students", icon: GraduationCap, category: "Navigation", show: true },
    { label: "Fee Collections & Receipts", path: "/erp/payments", icon: Receipt, category: "Navigation", show: erpUser?.role !== "counsellor" },
    { label: "Expenses & Settlements", path: "/erp/expenses", icon: Wallet, category: "Navigation", show: erpUser?.role !== "counsellor" },
    { label: "Prospect Leads Pipeline", path: "/erp/leads", icon: UserPlus, category: "Navigation", show: true },
    { label: "Gate Attendance Terminal", path: "/erp/erpattendance", icon: QrCode, category: "Navigation", show: true },
    { label: "Student ID Card Console", path: "/erp/erpidcards", icon: Contact2, category: "Navigation", show: erpUser?.role !== "counsellor" },
    { label: "Staff & Team Roster", path: "/erp/staff", icon: Users, category: "Navigation", show: erpUser?.role === "super_admin" || erpUser?.role === "admin" || erpUser?.role === "center_manager" },
    { label: "Network Branches", path: "/erp/branches", icon: Building2, category: "Navigation", show: erpUser?.role === "super_admin" || erpUser?.role === "admin" },
    { label: "WhatsApp Broadcast Studio", path: "/erp/whatsapp", icon: MessageSquare, category: "Navigation", show: true },
    { label: "Audit Ledger", path: "/erp/audit", icon: ScrollText, category: "Navigation", show: erpUser?.role === "super_admin" || erpUser?.role === "admin" },
  ].filter(p => p.show);

  // Quick Action triggers
  const quickActions = [
    { label: "New Admission Application", action: "new_admission", icon: GraduationCap, category: "Quick Action", show: erpUser?.role !== "counsellor" },
    { label: "Record Fee Payment", action: "new_payment", icon: Receipt, category: "Quick Action", show: erpUser?.role !== "counsellor" },
    { label: "Record Center Expense", action: "new_expense", icon: Wallet, category: "Quick Action", show: erpUser?.role !== "counsellor" },
    { label: "Add New Prospect Lead", action: "new_lead", icon: UserPlus, category: "Quick Action", show: true },
  ].filter(a => a.show);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setStudentResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live student search with debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setStudentResults([]);
      setIsSearchingStudents(false);
      return;
    }

    setIsSearchingStudents(true);
    const t = setTimeout(async () => {
      try {
        const res = await erp.listStudents({ q: query.trim(), limit: 5 });
        const items = Array.isArray(res) ? res : (res?.items || []);
        setStudentResults(items);
      } catch (err) {
        setStudentResults([]);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  // Filtered pages & actions
  const filteredPages = pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const allItems = [
    ...studentResults.map(s => ({ type: "student", data: s })),
    ...filteredActions.map(a => ({ type: "action", data: a })),
    ...filteredPages.map(p => ({ type: "page", data: p })),
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(allItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(allItems.length, 1));
      } else if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(allItems[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allItems]);

  const handleSelect = (item) => {
    onClose();
    if (item.type === "page") {
      nav(item.data.path);
    } else if (item.type === "action") {
      if (onAction) onAction(item.data.action);
    } else if (item.type === "student") {
      nav(`/erp/students/${encodeURIComponent(item.data.student_no || item.data.id)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      data-testid="erp-command-palette-backdrop"
    >
      <div 
        className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
        data-testid="erp-command-palette"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-muted/20 gap-3">
          <Search size={18} className="text-primary shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command, page, or search student by name/ID..."
            className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            data-testid="command-palette-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-border/20 custom-scrollbar flex-1">
          {/* Live Student Search Matches */}
          {studentResults.length > 0 && (
            <div className="pb-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-accent px-3 py-1.5 flex items-center gap-1.5">
                <User size={12} /> Students Matching Query
              </div>
              {studentResults.map((s, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelect({ type: "student", data: s })}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition ${
                      isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent shrink-0">
                        {s.full_name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-foreground truncate">{s.full_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{s.student_no} • {s.contact_phone || "No phone"}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono px-2 py-0.5 bg-muted rounded">
                      {s.batch || "Roster"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 py-1 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" /> Actions
              </div>
              {filteredActions.map((a, idx) => {
                const globalIndex = studentResults.length + idx;
                const isSelected = selectedIndex === globalIndex;
                const Icon = a.icon;
                return (
                  <div
                    key={a.action}
                    onClick={() => handleSelect({ type: "action", data: a })}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition ${
                      isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      <span>{a.label}</span>
                    </div>
                    <kbd className="text-[10px] font-mono text-muted-foreground">Action</kbd>
                  </div>
                );
              })}
            </div>
          )}

          {/* Page Jumps */}
          {filteredPages.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 py-1">
                Navigation
              </div>
              {filteredPages.map((p, idx) => {
                const globalIndex = studentResults.length + filteredActions.length + idx;
                const isSelected = selectedIndex === globalIndex;
                const Icon = p.icon;
                return (
                  <div
                    key={p.path}
                    onClick={() => handleSelect({ type: "page", data: p })}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition ${
                      isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      <span>{p.label}</span>
                    </div>
                    <ArrowRight size={12} className={isSelected ? "text-primary" : "text-muted-foreground/50"} />
                  </div>
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              {isSearchingStudents ? "Searching student directory..." : "No matching actions or pages found."}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">↵</kbd>
              Open
            </span>
          </div>
          <span className="font-semibold text-[10px] text-primary">Northend Enterprise ERP</span>
        </div>
      </div>
    </div>
  );
}
