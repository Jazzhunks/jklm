with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "r") as f:
    content = f.read()

# Make it wider
content = content.replace('max-w-md', 'max-w-xl')

# We can also add action buttons at the top right of the drawer!
header_old = """          <div>
            <h2 className="font-bold text-lg">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase tracking-wider">{lead.source || "Manual"}</span>
              <span className="text-xs font-medium text-muted-foreground">{lead.phone}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition"><X size={18} /></button>"""

header_new = """          <div>
            <h2 className="font-bold text-lg">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase tracking-wider">{lead.source || "Manual"}</span>
              <span className="text-xs font-medium text-muted-foreground">{lead.phone}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">{lead.status.replace("_", " ")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition"><X size={18} /></button>
          </div>"""
content = content.replace(header_old, header_new)

with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "w") as f:
    f.write(content)
print("Done patching drawer")
