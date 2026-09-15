with open("src/pages/erp/modals/GstSettlementModal.jsx", "r") as f:
    content = f.read()

# 1. Fix taxable_value -> base_amount in the table
content = content.replace("{fmtINR(r.taxable_value)}", "{fmtINR(r.base_amount)}")

# 2. Fix mode breakdown mapping
old_mode = """                    <div className="text-sm font-bold text-foreground mt-1">
                      {fmtINR(info.amount)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      GST: {fmtINR(info.tax)} ({info.count} receipts)
                    </div>"""

new_mode = """                    <div className="text-sm font-bold text-foreground mt-1">
                      {fmtINR(info.gross)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      GST: {fmtINR((info.cgst || 0) + (info.sgst || 0))} ({info.count} txns)
                    </div>"""

content = content.replace(old_mode, new_mode)

with open("src/pages/erp/modals/GstSettlementModal.jsx", "w") as f:
    f.write(content)
print("Done")
