import re

with open("src/pages/erp/ErpPayments.jsx", "r") as f:
    content = f.read()

# I will just regex replace the buttons inside the table data cell.
old_block = """                      <button 
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-lg transition" 
                        data-testid={`receipt-${p.id}`}
                        title="View Receipt (A4 or Thermal POS)"
                      >
                        <Printer size={12} /> Receipt
                      </button>
                      <a 
                        href={`${API_BASE}/erp/payments/${p.id}/receipt`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition" 
                        title="Direct A4 PDF Download"
                        data-testid={`dl-${p.id}`}
                      >
                        <Download size={14} />
                      </a>
                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPaymentModal(p)}
                            className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition"
                            title="Edit Payment Transaction"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(p)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                            title="Purge Payment Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}"""

new_block = """                      <button 
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
                      )}"""

content = content.replace(old_block, new_block)

with open("src/pages/erp/ErpPayments.jsx", "w") as f:
    f.write(content)
