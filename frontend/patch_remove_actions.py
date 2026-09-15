with open("src/pages/erp/ErpPayments.jsx", "r") as f:
    content = f.read()

old_headers = """              <tr className="text-left backdrop-blur-md">
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Receipt ID</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Date</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Student ID</th>
                <th className="w-[12%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Mode</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Collected By</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-muted">Net Amount</th>
                <th className="w-[12%] px-5 py-3.5 bg-muted text-right">Actions</th>
              </tr>"""

new_headers = """              <tr className="text-left backdrop-blur-md">
                <th className="w-[20%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Receipt ID</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Date</th>
                <th className="w-[20%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Student ID</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Mode</th>
                <th className="w-[16%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-muted">Collected By</th>
                <th className="w-[14%] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right bg-muted pr-10">Net Amount</th>
              </tr>"""

old_row = """                  <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-600 whitespace-nowrap text-sm">{fmtINR(p.amount)}</td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => sendWhatsAppReceipt(p)}
                        title="Send Receipt via WhatsApp"
                        className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition"
                      >
                        <MessageSquare size={15} />
                      </button>
                      <button 
                        onClick={() => setSelectedReceipt(p)} 
                        className="w-8 h-8 flex items-center justify-center text-accent bg-accent/10 border border-transparent hover:border-accent/20 hover:bg-accent/20 rounded-lg transition" 
                        data-testid={`receipt-${p.id}`}
                        title="View Receipt (A4 or Thermal POS)"
                      >
                        <Printer size={15} />
                      </button>
                      <a 
                        href={`${API_BASE}/erp/payments/${p.id}/receipt`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-muted/10 border border-transparent hover:border-border hover:bg-muted/30 hover:text-foreground rounded-lg transition" 
                        title="Direct A4 PDF Download"
                        data-testid={`dl-${p.id}`}
                      >
                        <Download size={15} />
                      </a>
                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPaymentModal(p)}
                            className="w-8 h-8 flex items-center justify-center text-amber-500 bg-amber-500/10 border border-transparent hover:border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition"
                            title="Edit Payment Transaction"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(p)}
                            className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-500/10 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition"
                            title="Purge Payment Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>"""

new_row = """                  <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-600 whitespace-nowrap text-sm pr-10">{fmtINR(p.amount)}</td>"""

content = content.replace(old_headers, new_headers).replace(old_row, new_row)
content = content.replace('<td colSpan="7"', '<td colSpan="6"')

with open("src/pages/erp/ErpPayments.jsx", "w") as f:
    f.write(content)
print("Done")
