with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

import re

# Add lookup method
if "lookupPhone:" not in content:
    old_line_regex = re.compile(r'  deleteLead: \(id\) => api\.delete\(`/erp/leads/\$\{encodeURIComponent\(id\)\}`\)\.then\(resData\)\.then\(\(d\) => \{ broadcastMutation\("lead", "delete", \{ id \}\); return d; \}\),')
    new_lines = """  deleteLead: (id) => api.delete(`/erp/leads/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("lead", "delete", { id }); return d; }),
  lookupPhone: (phone) => api.get(`/erp/students/lookup?phone=${encodeURIComponent(phone)}`).then(resData),"""
    content = old_line_regex.sub(new_lines, content)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done patching erpApi.js for lookupPhone")
