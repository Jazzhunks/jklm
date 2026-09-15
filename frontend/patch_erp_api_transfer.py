with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

new_funcs = """  rejectLead: async (id, payload) => (await api.post(`/erp/leads/${id}/reject`, payload)).data,
  transferLead: async (id, payload) => (await api.post(`/erp/leads/${id}/transfer`, payload)).data,"""

content = content.replace("rejectLead: async (id, payload) => (await api.post(`/erp/leads/${id}/reject`, payload)).data,", new_funcs)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done erpApi.js transfer")
