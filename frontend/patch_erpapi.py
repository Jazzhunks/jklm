with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

content = content.replace(
    '  deletePayment: (id) => api.delete(`/erp/payments/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("payment", "delete", { id }); return d; }),',
    '  updatePayment: (id, body) => api.patch(`/erp/payments/${encodeURIComponent(id)}`, body).then(resData).then((d) => { broadcastMutation("payment", "update", d); return d; }),\n  deletePayment: (id) => api.delete(`/erp/payments/${encodeURIComponent(id)}`).then(resData).then((d) => { broadcastMutation("payment", "delete", { id }); return d; }),'
)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
