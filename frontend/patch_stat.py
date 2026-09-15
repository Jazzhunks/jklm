with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

old_stat = """const Stat = ({ label, value, icon: Icon, accent, testid }) => (
  <div className="bg-card border border-border/50 rounded-2xl p-5 relative overflow-hidden group hover:border-border transition-colors shadow-sm" data-testid={testid}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {Icon && <Icon size={80} className={accent || "text-foreground"}/>}
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-muted/50 border border-border/50 shadow-inner ${accent || "text-foreground"}`}>
        {Icon && <Icon size={22} className={accent || "text-muted-foreground"}/>}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
        <TrendingUp size={12} /> +12%
      </div>
    </div>"""

new_stat = """const Stat = ({ label, value, icon: Icon, accent, testid, trend }) => (
  <div className="bg-card border border-border/50 rounded-2xl p-5 relative overflow-hidden group hover:border-border transition-colors shadow-sm" data-testid={testid}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {Icon && <Icon size={80} className={accent || "text-foreground"}/>}
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-muted/50 border border-border/50 shadow-inner ${accent || "text-foreground"}`}>
        {Icon && <Icon size={22} className={accent || "text-muted-foreground"}/>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
          trend.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 
          trend.startsWith('-') ? 'text-rose-500 bg-rose-500/10' : 
          'text-muted-foreground bg-muted'
        }`}>
          {trend.startsWith('+') ? <TrendingUp size={12} /> : trend.startsWith('-') ? <TrendingDown size={12} /> : null}
          {trend}
        </div>
      )}
    </div>"""

content = content.replace(old_stat, new_stat)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done patching Stat")
