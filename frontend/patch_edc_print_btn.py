with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

old_table_actions = """                        <FileDown size={15}/>
                      </a>
                      {isSuper(erpUser) && ("""

new_table_actions = """                        <FileDown size={15}/>
                      </a>
                      <button
                        onClick={async () => {
                          toast.loading("Sending receipt to EDC printer...", { id: `edc-${p.id}` });
                          try {
                            await api.post(`/erp/payments/${encodeURIComponent(p.id)}/pinelabs/print`);
                            toast.success("Receipt printed successfully", { id: `edc-${p.id}` });
                          } catch (err) {
                            toast.error(formatError(err.response?.data?.detail) || "Failed to print on EDC", { id: `edc-${p.id}` });
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center text-sky-500 bg-sky-500/10 border border-transparent hover:border-sky-500/20 hover:bg-sky-500/20 rounded-lg transition"
                        title="Print Receipt on EDC Terminal"
                        data-testid={`print-edc-${p.id}`}
                      >
                        <Printer size={15}/>
                      </button>
                      {isSuper(erpUser) && ("""

content = content.replace(old_table_actions, new_table_actions)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done adding EDC print button")
