with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

# We want to add it to the `export const erp = {` object
old_str = "updateLead: async (id, data) => (await api.patch(`/erp/leads/${id}`, data)).data,"
new_str = "updateLead: async (id, data) => (await api.patch(`/erp/leads/${id}`, data)).data,\n  addLeadInteraction: async (id, payload) => (await api.post(`/erp/leads/${id}/interactions`, payload)).data,"

content = content.replace(old_str, new_str)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done erpApi.js again")
