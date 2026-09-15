with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

funcs = """
  // --- Treasury ---
  getTreasurySummary: (params = {}) => api.get("/erp/treasury/summary", { params }).then(resData),
  listTreasuryTransfers: (params = {}) => api.get("/erp/treasury/transfers", { params }).then(resData),
  createTreasuryTransfer: (body) => api.post("/erp/treasury/transfers", body).then(resData).then((d) => { broadcastMutation("treasury", "create", d); return d; }),
"""
content = content.replace("// --- File Operations ---", funcs + "\n  // --- File Operations ---")

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
