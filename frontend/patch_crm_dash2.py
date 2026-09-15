with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Make sure recharts is imported
if 'import { PieChart' not in content:
    import_recharts = 'import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";\nimport { TrendingUp, Users, Target, Activity } from "lucide-react";'
    content = content.replace('import { \n  Plus, X, Search, Smartphone, Edit3, MessageSquare, Calendar,', import_recharts + '\nimport { \n  Plus, X, Search, Smartphone, Edit3, MessageSquare, Calendar,')

# Insert the CRM Dashboard
insertion_point = "{/* Filter and Search Bar */}"
crm_dashboard = """
      {/* $10B Enterprise CRM Dashboard - Analytical View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        
        {/* Metric 1 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Users size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Pipeline Leads</h3>
          <div className="text-3xl font-black text-foreground font-display">{items?.length || 0}</div>
          <div className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-2 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full"><TrendingUp size={12}/> High Volume</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Target size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Win Rate</h3>
          <div className="text-3xl font-black text-emerald-600 font-display">
            {items?.length ? Math.round(((stageBuckets["converted"]?.length || 0) / items.length) * 100) : 0}%
          </div>
          <div className="text-[10px] font-semibold text-sky-500 flex items-center gap-1 mt-2 bg-sky-500/10 w-fit px-2 py-0.5 rounded-full"><Activity size={12}/> {stageBuckets["converted"]?.length || 0} Enrolled</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-amber-500/5 border border-amber-500/30 shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-amber-500"><AlertCircle size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Follow-ups Due Today</h3>
          <div className="text-3xl font-black text-amber-500 font-display">
            {stageBuckets["follow_up"]?.filter(l => l.next_followup_at && new Date(l.next_followup_at).toDateString() === new Date().toDateString()).length || 0}
          </div>
          <div className="text-[10px] font-semibold text-amber-500 flex items-center gap-1 mt-2 bg-amber-500/20 w-fit px-2 py-0.5 rounded-full">Requires Immediate Action</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><TrendingUp size={64}/></div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pipeline Potential</h3>
          <div className="text-3xl font-black text-indigo-500 font-display">
            ₹{(((items?.length || 0) * 45000) / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] font-semibold text-indigo-500 flex items-center gap-1 mt-2 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full">Estimated Value (Avg ₹45k)</div>
        </div>
      </div>
      
      {/* Visual Pipeline Funnel (Simplified) */}
      <div className="bg-card border border-border shadow-sm rounded-2xl p-4 flex items-center gap-1 overflow-x-auto shrink-0">
        {STAGES.map((s, idx) => {
          const count = stageBuckets[s.id]?.length || 0;
          const total = items?.length || 1;
          const percent = Math.max(8, Math.round((count / total) * 100));
          return (
            <div key={s.id} className={`h-12 flex items-center justify-between px-3 rounded-xl ${s.style} border min-w-[120px] transition-all`} style={{ flexBasis: `${percent}%`, flexGrow: 1 }}>
              <div className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.label}</div>
              <div className="text-lg font-black">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}"""

content = content.replace(insertion_point, crm_dashboard)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done CRM Dashboard injection")
