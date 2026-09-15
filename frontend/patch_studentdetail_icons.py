with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

old_block = """                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-lg transition"
                        title="View Receipt"
                        data-testid={`receipt-modal-${p.id}`}
                      >
                        <Printer size={11}/> Receipt
                      </button>
                      <a 
                        href={`${API_BASE}/erp/payments/${p.id}/receipt`} 
                        target="_blank" rel="noreferrer"
                        className="p-1.5 hover:bg-muted/50 border border-transparent hover:border-border rounded-lg text-muted-foreground hover:text-foreground transition"
                        title="Download PDF"
                        data-testid={`download-receipt-${p.id}`}
                      >
                        <FileDown size={13}/>
                      </a>
                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPayment(p)}
                            className="p-1.5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 rounded-lg text-amber-500 transition"
                            title="Edit Transaction"
                          >
                            <Edit3 size={13}/>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: "payment", id: p.id, label: p.receipt_no })}
                            className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg text-rose-500 transition"
                            title="Delete Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={13}/>
                          </button>
                        </>
                      )}
                    </div>"""

new_block = """                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="w-8 h-8 flex items-center justify-center text-accent bg-accent/10 border border-transparent hover:border-accent/20 hover:bg-accent/20 rounded-lg transition"
                        title="View Receipt"
                        data-testid={`receipt-modal-${p.id}`}
                      >
                        <Printer size={15}/>
                      </button>
                      <a 
                        href={`${API_BASE}/erp/payments/${p.id}/receipt`} 
                        target="_blank" rel="noreferrer"
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-muted/10 border border-transparent hover:border-border hover:bg-muted/30 hover:text-foreground rounded-lg transition"
                        title="Download PDF"
                        data-testid={`download-receipt-${p.id}`}
                      >
                        <FileDown size={15}/>
                      </a>
                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPayment(p)}
                            className="w-8 h-8 flex items-center justify-center text-amber-500 bg-amber-500/10 border border-transparent hover:border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition"
                            title="Edit Transaction"
                          >
                            <Edit3 size={15}/>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: "payment", id: p.id, label: p.receipt_no })}
                            className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-500/10 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition"
                            title="Delete Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={15}/>
                          </button>
                        </>
                      )}
                    </div>"""

content = content.replace(old_block, new_block)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
