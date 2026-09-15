with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# I will find the end of the top stats section and insert the Due Today widget.
old_stats = """            title="Closed/Lost"
            value={stageBuckets["lost"]?.length || 0}
            icon={X}
            color="rose"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}"""

new_stats = """            title="Closed/Lost"
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
      </div>

      {/* Filter and Search Bar */}"""

content = content.replace(old_stats, new_stats)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching due today widget")
