import re

with open("src/pages/erp/ErpLayout.jsx", "r") as f:
    content = f.read()

old_nav = """const NAV = [
  { to: "/erp", label: "Dashboard", icon: LayoutDashboard, exact: true, show: () => true },
  { to: "/erp/students", label: "Students", icon: GraduationCap, show: () => true },
  { to: "/erp/payments", label: "Fee Collections", icon: Receipt, show: (u) => u.role !== "counsellor" },
  { to: "/erp/expenses", label: "Expenses", icon: Wallet, show: (u) => u.role !== "counsellor" },
  { to: "/erp/leads", label: "Leads", icon: UserPlus, show: () => true },
  { to: "/erp/staff", label: "Staff", icon: Users, show: isManagerPlus },
  { to: "/erp/branches", label: "Branches", icon: Building2, show: isSuper },
  { to: "/erp/audit", label: "Audit Log", icon: ScrollText, show: isSuper },
  { to: "/erp/erpattendance", label: "Gate Attendance", icon: QrCode, show: () => true },
  { to: "/erp/erpidcards", label: "ID Cards", icon: Contact2, show: (u) => u.role === "super_admin" || u.role === "admin" || u.role === "accountant" || u.role === "center_manager" },
  { to: "/erp/whatsapp", label: "WhatsApp Broadcast", icon: MessageSquare, show: () => true },
];"""

new_nav = """const NAV = [
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

content = content.replace(old_nav, new_nav)

with open("src/pages/erp/ErpLayout.jsx", "w") as f:
    f.write(content)
