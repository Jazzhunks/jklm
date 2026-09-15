with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

old_mode = """                  <td className="px-5 py-3.5">
                    <span className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] font-bold text-muted-foreground uppercase">{p.mode}</span>
                  </td>"""

new_mode = """                  <td className="px-5 py-3.5 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] font-bold text-muted-foreground uppercase">{p.mode}</span>
                    {p.status === "pending" && (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase animate-pulse">Waiting for EDC</span>
                    )}
                  </td>"""

content = content.replace(old_mode, new_mode)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching payment status UI")
