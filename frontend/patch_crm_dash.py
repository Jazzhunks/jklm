with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Add PieChart and BarChart to imports
import_recharts = 'import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";\nimport { TrendingUp, Users, Target, Activity } from "lucide-react";'
content = content.replace('import { \n  Plus, X, Search, Smartphone, Edit3, MessageSquare, Calendar,', import_recharts + '\nimport { \n  Plus, X, Search, Smartphone, Edit3, MessageSquare, Calendar,')

# Find the stats container to replace it with a massive CRM dashboard
old_stats = """      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 shrink-0">
        <StatCard
          title="New Inquiries"
          value={stageBuckets["new"]?.length || 0}
          icon={List}
          color="sky"
        />
        <StatCard
          title="Contacted"
          value={stageBuckets["contacted"]?.length || 0}
          icon={UserCheck}
          color="indigo"
        />
        <div className="hidden lg:block">
          <StatCard
            title="Follow-ups"
            value={stageBuckets["follow_up"]?.length || 0}
            icon={Clock}
            color="amber"
          />
        </div>
        <StatCard
          title="Enrolled"
          value={stageBuckets["converted"]?.length || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <div className="hidden md:block">
          <StatCard
            title="Closed/Lost"
            value={stageBuckets["lost"]?.length || 0}
            icon={X}
            color="rose"
          />
        </div>
        
        {/* Follow Ups Due Today */}
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
              <AlertCircle size={16} /> Follow-ups Due Today
            </h3>
            <p className="text-xs text-amber-500/80 mt-1">Keep the momentum going. These leads require your attention today.</p>
          </div>
          <div className="text-2xl font-black text-amber-500 font-mono">
            {stageBuckets["follow_up"]?.filter(l => l.next_followup_at && new Date(l.next_followup_at).toDateString() === new Date().toDateString()).length || 0}
          </div>
        </div>
      </div>"""

new_stats = """      {/* 10B Enterprise CRM Dashboard - Analytical View */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 shrink-0">
        
        {/* Metric 1 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Users size={64}/></div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Leads (All Stages)</h3>
          <div className="text-3xl font-black text-foreground font-display">{leadsData?.length || 0}</div>
          <div className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-2 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full"><TrendingUp size={12}/> High Volume</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Target size={64}/></div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Conversion Rate</h3>
          <div className="text-3xl font-black text-emerald-600 font-display">
            {leadsData?.length ? Math.round(((stageBuckets["converted"]?.length || 0) / leadsData.length) * 100) : 0}%
          </div>
          <div className="text-[10px] font-semibold text-sky-500 flex items-center gap-1 mt-2 bg-sky-500/10 w-fit px-2 py-0.5 rounded-full"><Activity size={12}/> {stageBuckets["converted"]?.length || 0} Enrolled</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><AlertCircle size={64}/></div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Follow-ups Due Today</h3>
          <div className="text-3xl font-black text-amber-500 font-display">
            {stageBuckets["follow_up"]?.filter(l => l.next_followup_at && new Date(l.next_followup_at).toDateString() === new Date().toDateString()).length || 0}
          </div>
          <div className="text-[10px] font-semibold text-amber-500 flex items-center gap-1 mt-2 bg-amber-500/10 w-fit px-2 py-0.5 rounded-full">Requires Immediate Action</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><TrendingUp size={64}/></div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Pipeline Potential</h3>
          <div className="text-3xl font-black text-indigo-500 font-display">
            ₹{((leadsData?.length || 0) * 45000 / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] font-semibold text-indigo-500 flex items-center gap-1 mt-2 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full">Estimated Value (Avg ₹45k)</div>
        </div>
      </div>
      
      {/* Visual Pipeline Funnel (Simplified) */}
      <div className="bg-card border border-border shadow-sm rounded-2xl p-4 flex items-center gap-1 overflow-x-auto">
        {STAGES.map((s, idx) => {
          const count = stageBuckets[s.id]?.length || 0;
          const total = leadsData?.length || 1;
          const percent = Math.max(5, Math.round((count / total) * 100));
          return (
            <div key={s.id} className={`h-12 flex items-center justify-between px-3 rounded-lg ${s.style} border min-w-[120px] transition-all`} style={{ flexBasis: `${percent}%`, flexGrow: 1 }}>
              <div className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.label}</div>
              <div className="text-lg font-black">{count}</div>
            </div>
          );
        })}
      </div>"""

content = content.replace(old_stats, new_stats)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done CRM Dashboard update")
