with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

old_header = '<h3 className="font-display font-medium text-lg mb-6">Revenue vs Expense by Branch</h3>'
new_header = """<div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-medium text-lg">Financial Overview (All Branches)</h3>
            <button className="text-xs font-bold bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg transition border border-border">Download Report</button>
          </div>"""
content = content.replace(old_header, new_header)

old_table_header = '<h3 className="font-display font-medium text-lg">Branch Metrics Summary</h3>'
new_table_header = """<h3 className="font-display font-medium text-lg">Branch Metrics Summary</h3>
          <div className="flex gap-2">
            <button className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-md transition border border-primary/20">All Time</button>
            <button className="text-[10px] uppercase tracking-wider font-bold bg-muted text-muted-foreground hover:bg-muted/80 px-3 py-1.5 rounded-md transition">This Month</button>
          </div>"""
content = content.replace(old_table_header, new_table_header)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done patching Admin View UI")
