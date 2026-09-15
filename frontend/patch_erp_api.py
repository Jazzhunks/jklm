with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

# Append constants and fetchers
constants = """
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
"""
if "STUDENT_CLASSES" not in content:
    content = content.replace("export const isERPUser = (user) => ERP_ROLES.has(user?.role);", "export const isERPUser = (user) => ERP_ROLES.has(user?.role);\n" + constants)

# Add getFeeMatrix and updateFeeMatrix to erp object
old_erp = """  deleteLead: (id) => api.delete(`/erp/leads/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("lead", "delete", {id}); return d; }),"""
new_erp = """  deleteLead: (id) => api.delete(`/erp/leads/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("lead", "delete", {id}); return d; }),
  getFeeMatrix: () => api.get("/erp/fee-matrix").then(resData),
  updateFeeMatrix: (matrix) => api.post("/erp/fee-matrix", { matrix }).then(resData),"""
if "getFeeMatrix" not in content:
    content = content.replace(old_erp, new_erp)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done patching erpApi.js")
