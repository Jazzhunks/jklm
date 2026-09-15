import { api } from "./api";
import { broadcastMutation } from "./realtime";

// 1. DRY Data Extractor: Saves you from typing `.then(r => r.data)` on basic handshakes.
const resData = (res) => res.data;

export const erp = {
  // --- Auth & Meta ---
  me: () => api.get("/erp/me").then(resData),
  meta: () => api.get("/erp/meta").then(resData),

  // ============================================================================
  // ATTENDANCE MODULE ENDPOINTS (SYNCHRONIZED WITH ERPATTENDANCE SUITE)
  // ============================================================================
  
  /**
   * Fetches historical check-in record lists filterable by branch parameters.
   */
  listAttendanceLogs: (params = {}) => api.get("/erp/erpattendance", { params }).then(resData),
  
  /**
   * Dispatches hardware scanner string tokens down to the verification engine.
   * @param {Object} body - { student_no: "NES-SRI-0001", device_signature: "GATE-01" }
   */
  submitAttendanceScan: (body) => api.post("/erp/erpattendance/scan", body).then(resData),
  
  /**
   * Injects an immediate forced state logging bypass into the branch registry ledger.
   * @param {Object} body - { student_id: "uuid-string", status: "present" | "late" }
   */
  submitManualAttendanceOverride: (body) => api.post("/erp/erpattendance/override", body).then(resData),
  
  /**
   * Instantiates an active Server-Sent Events (SSE) stream client connection string.
   */
  getAttendanceStreamUrl: (branchId) => {
    const base = process.env.REACT_APP_BACKEND_URL || "";
    return `${base}/api/erp/erpattendance/stream/${encodeURIComponent(branchId)}`;
  },

  // --- Branches ---
  listBranches: () => api.get("/erp/branches").then(resData),
  updateBranch: (id, body) => api.patch(`/erp/branches/${encodeURIComponent(id)}`, body).then(resData),

  // --- Staff ---
  listStaff: (branch_id) => api.get("/erp/staff", { params: branch_id ? { branch_id } : {} }).then(resData),
  createStaff: (body) => api.post("/erp/staff", body).then(resData),
  updateStaff: (id, body) => api.patch(`/erp/staff/${encodeURIComponent(id)}`, body).then(resData),
  deactivateStaff: (id) => api.delete(`/erp/staff/${encodeURIComponent(id)}`).then(resData),

  // --- Students (MULTIPART / FORM-DATA TRAFFIC COMPLIANT) ---
  listStudents: (params = {}) => api.get("/erp/students", { params }).then(resData),
  getStudent: (id) => api.get(`/erp/students/${encodeURIComponent(id)}`).then(resData),
  deleteStudent: (id) => api.delete(`/erp/students/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("student", "delete", { id }); return d; }),
  uploadPhoto: (id, formData) => api.post(`/erp/students/${encodeURIComponent(id)}/photo`, formData).then(resData).then((d) => { broadcastMutation("student", "photo_update", { id }); return d; }),
  idCardQueue: (params = {}) => api.get("/erp/id-cards/queue", { params }).then(resData),
  listTempStudents: (params = {}) => api.get("/erp/temp-students", { params }).then(resData),
  checkTempStudent: (phone, branch_id) => api.get("/erp/temp-students/check", { params: { phone, branch_id } }).then(resData),
  mergeTempStudent: (id) => api.post(`/erp/temp-students/${encodeURIComponent(id)}/merge`).then(resData).then((d) => { broadcastMutation("temp_student", "merge", { id }); return d; }),
  nullifyTempStudent: (id) => api.post(`/erp/temp-students/${encodeURIComponent(id)}/nullify`).then(resData).then((d) => { broadcastMutation("temp_student", "nullify", { id }); return d; }),
  
  /**
   * Accepts both direct JSON payloads and standard binary payload objects seamlessly.
   * @param {FormData | Object} body - Binary multipart compiler fields context.
   */
  createStudent: (body) => {
    return api.post("/erp/students", body).then(resData).then((d) => { broadcastMutation("student", "create", d); return d; });
  },
  
  updateStudent: (id, body) => {
    return api.patch(`/erp/students/${encodeURIComponent(id)}`, body).then(resData).then((d) => { broadcastMutation("student", "update", { id, ...d }); return d; });
  },
  
  studentStatement: (id) => api.get(`/erp/students/${encodeURIComponent(id)}/statement`).then(resData),

  // --- Payments ---
  listPayments: (params = {}) => api.get("/erp/payments", { params }).then(resData),
  createPayment: (body) => api.post("/erp/payments", body).then(resData).then((d) => { broadcastMutation("payment", "create", d); return d; }),
  updatePayment: (id, body) => api.patch(`/erp/payments/${encodeURIComponent(id)}`, body).then(resData).then((d) => { broadcastMutation("payment", "update", d); return d; }),
  deletePayment: (id) => api.delete(`/erp/payments/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("payment", "delete", { id }); return d; }),

  // --- Expenses ---
  listExpenses: (params = {}) => api.get("/erp/expenses", { params }).then(resData),
  createExpense: (body) => api.post("/erp/expenses", body).then(resData).then((d) => { broadcastMutation("expense", "create", d); return d; }),
  decideExpense: (id, body) => api.post(`/erp/expenses/${encodeURIComponent(id)}/decision`, body).then(resData).then((d) => { broadcastMutation("expense", "decision", { id, ...body }); return d; }),
  deleteExpense: (id) => api.delete(`/erp/expenses/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("expense", "delete", { id }); return d; }),

  // --- Leads ---
  listLeads: (params = {}) => api.get("/erp/leads", { params }).then(resData),
  createLead: (body) => api.post("/erp/leads", body).then(resData).then((d) => { broadcastMutation("lead", "create", d); return d; }),
  updateLead: (id, body) => api.patch(`/erp/leads/${encodeURIComponent(id)}`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id, ...d }); return d; }),
  deleteLead: (id) => api.delete(`/erp/leads/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("lead", "delete", { id }); return d; }),
  addLeadInteraction: (id, body) => api.post(`/erp/leads/${id}/interactions`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id }); return d; }),
  proposeLead: (id, body) => api.post(`/erp/leads/${id}/propose`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id }); return d; }),
  approveLead: (id, body) => api.post(`/erp/leads/${id}/approve`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id }); return d; }),
  rejectLead: (id, body) => api.post(`/erp/leads/${id}/reject`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id }); return d; }),
  enrollLead: (id, body) => api.post(`/erp/leads/${id}/enroll`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id }); return d; }),
  transferLead: (id, body) => api.post(`/erp/leads/${id}/transfer`, body).then(resData).then((d) => { broadcastMutation("lead", "update", { id }); return d; }),

  // --- GST Taxation & Compliance ---
  monthlyGst: (params = {}) => api.get("/erp/gst/monthly", { params }).then(resData),
  markGstPaid: (body) => api.post("/erp/gst/mark-paid", body).then(resData).then((d) => { broadcastMutation("gst_filing", "update", d); return d; }),
  getGstExportUrl: (month, branch_id) => {
    const base = process.env.REACT_APP_BACKEND_URL || "";
    let u = `${base}/api/erp/exports/gst.xlsx?month=${encodeURIComponent(month)}`;
    if (branch_id) u += `&branch_id=${encodeURIComponent(branch_id)}`;
    return u;
  },

  // --- Dashboards ---
  superDashboard: () => api.get("/erp/dashboard/super").then(resData),
  branchDashboard: (branch_id) => api.get(`/erp/dashboard/branch/${encodeURIComponent(branch_id)}`).then(resData),

  // --- Audit ---
  audit: (params = {}) => api.get("/erp/audit", { params }).then(resData),

  // --- Treasury & Banking ---
  getTreasurySummary: (params = {}) => api.get('/erp/treasury/summary', { params }).then(resData),
  listTreasuryTransfers: (params = {}) => api.get('/erp/treasury/transfers', { params }).then(resData),
  createTreasuryTransfer: (body) => api.post('/erp/treasury/transfers', body).then(resData),
};


// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM HELPERS
// ============================================================================

export const isSuper = (user) => user?.role === "super_admin" || user?.role === "admin";
export const isManagerPlus = (user) => isSuper(user) || user?.role === "center_manager";
export const isFinance = (user) => isManagerPlus(user) || user?.role === "accountant";
export const canSeeStaff = isManagerPlus;

// Grants accountants explicit permission privileges to write and manage student records
export const canManageStudents = (user) => isSuper(user) || user?.role === "center_manager" || user?.role === "accountant";

const ERP_ROLES = new Set(["super_admin", "admin", "center_manager", "accountant", "counsellor", "attendance"]);
export const isERPUser = (user) => ERP_ROLES.has(user?.role);

// ============================================================================
// GLOBAL ERP CONSTANTS
// ============================================================================
export const STUDENT_CLASSES = [
  "Biggner (8th)",
  "Adapt (9th)",
  "Elivate (10th)",
  "Growth (11th)",
  "Excel (12th)",
  "Conqurer (Dropper)"
];

export const STUDENT_COURSES = [
  "Foundation",
  "IIT JEE",
  "NEET UG"
];


// ============================================================================
// LOCALIZED FORMATTING UTILITY MATRIX
// ============================================================================

/**
 * Formats a number securely into Indian Rupees (INR) with native comma spacing patterns
 */
export const fmtINR = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "₹0.00";
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Safely formats an ISO timestamp string into localized Indian date notations (e.g., 25 May 2026)
 */
export const fmtDate = (s, includeTime = false) => {
  if (!s) return "—";
  try {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(s));
  } catch {
    return String(s);
  }
};

/**
 * Safely extracts items array whether API returns raw array or paginated object { items, total }
 */
export const extractItems = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

/**
 * Safely extracts total record count from array or paginated response
 */
export const extractTotal = (data) => {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data.total === "number") return data.total;
  if (Array.isArray(data.items)) return data.items.length;
  return 0;
};