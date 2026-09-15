with open("src/pages/erp/ErpLayout.jsx", "r") as f:
    content = f.read()

old_nav = """const NAV = [
  { to: "/erp", label: "Dashboard", icon: LayoutDashboard, exact: true, show: (u) => u.role !== "attendance" },
  { to: "/erp/students", label: "Students", icon: GraduationCap, show: (u) => u.role !== "attendance" },
  { to: "/erp/payments", label: "Fee Collections", icon: Receipt, show: (u) => u.role !== "counsellor" && u.role !== "attendance" },
  { to: "/erp/expenses", label: "Expenses", icon: Wallet, show: (u) => u.role !== "counsellor" && u.role !== "attendance" },
  { to: "/erp/leads", label: "Leads", icon: UserPlus, show: (u) => u.role !== "attendance" },
  { to: "/erp/staff", label: "Staff", icon: Users, show: (u) => isManagerPlus(u) && u.role !== "attendance" },
  { to: "/erp/branches", label: "Branches", icon: Building2, show: (u) => isSuper(u) && u.role !== "attendance" },
  { to: "/erp/audit", label: "Audit Log", icon: ScrollText, show: (u) => isSuper(u) && u.role !== "attendance" },
  { to: "/erp/erpattendance", label: "Gate Attendance", icon: QrCode, show: () => true },
  { to: "/erp/erpidcards", label: "ID Cards", icon: Contact2, show: (u) => (u.role === "super_admin" || u.role === "admin" || u.role === "accountant" || u.role === "center_manager") && u.role !== "attendance" },
  { to: "/erp/whatsapp", label: "WhatsApp Broadcast", icon: MessageSquare, show: (u) => u.role !== "attendance" },
];"""

new_nav = """const NAV = [
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
];"""

content = content.replace(old_nav, new_nav)

with open("src/pages/erp/ErpLayout.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLayout Nav")
