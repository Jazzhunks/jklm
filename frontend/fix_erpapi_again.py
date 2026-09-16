with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

import re

# Add getFeeMatrix and updateFeeMatrix
if "getFeeMatrix:" not in content:
    old_line_regex = re.compile(r'  deleteLead: \(id\) => api\.delete\(`/erp/leads/\$\{encodeURIComponent\(id\)\}`\)\.then\(resData\)\.then\(\(d\) => \{ broadcastMutation\("lead", "delete", \{ id \}\); return d; \}\),')
    new_lines = """  deleteLead: (id) => api.delete(`/erp/leads/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("lead", "delete", { id }); return d; }),
  getFeeMatrix: () => api.get("/erp/fee-matrix").then(resData),
  updateFeeMatrix: (matrix) => api.post("/erp/fee-matrix", { matrix }).then(resData),"""
    content = old_line_regex.sub(new_lines, content)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done fixing erpApi.js methods")
