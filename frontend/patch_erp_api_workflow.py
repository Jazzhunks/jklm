with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

new_funcs = """  addLeadInteraction: async (id, payload) => (await api.post(`/erp/leads/${id}/interactions`, payload)).data,
  proposeLead: async (id, payload) => (await api.post(`/erp/leads/${id}/propose`, payload)).data,
  approveLead: async (id, payload) => (await api.post(`/erp/leads/${id}/approve`, payload)).data,
  rejectLead: async (id, payload) => (await api.post(`/erp/leads/${id}/reject`, payload)).data,
  enrollLead: async (id, payload) => (await api.post(`/erp/leads/${id}/enroll`, payload)).data,"""

content = content.replace("addLeadInteraction: async (id, payload) => (await api.post(`/erp/leads/${id}/interactions`, payload)).data,", new_funcs)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done erpApi.js updates")
