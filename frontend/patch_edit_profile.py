with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

# 1. Restore the Edit Profile button
old_btn = """{isSuper(erpUser) && (
            <button 
              onClick={() => setShowEditProfile(true)} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
            >
              <Edit3 size={13}/> Edit Profile
            </button>
          )}"""

new_btn = """<button 
            onClick={() => setShowEditProfile(true)} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
          >
            <Edit3 size={13}/> Edit Profile
          </button>"""

content = content.replace(old_btn, new_btn)

# 2. Modify the financial section
old_fin = """          {canEditFinances && (
            <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/5 space-y-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-accent">
                Fee Schedule & Financial Overrides
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Gross Fee (₹)</label>
                  <input type="number" value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Scholarship %</label>
                  <input type="number" min="0" max="100" value={form.scholarship_percent} onChange={e => setForm({...form, scholarship_percent: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Discount (₹)</label>
                  <input type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-accent/20 text-xs">
                <span className="text-muted-foreground">Computed Net Fee:</span>
                <span className="font-mono font-bold text-accent">{fmtINR(computedNet)}</span>
              </div>
            </div>
          )}"""

new_fin = """          <div className={`p-3.5 rounded-xl border ${canEditFinances ? 'border-accent/30 bg-accent/5' : 'border-border/50 bg-muted/10'} space-y-3`}>
            <div className={`text-[11px] uppercase tracking-wider font-bold ${canEditFinances ? 'text-accent' : 'text-muted-foreground'}`}>
              Fee Schedule & Financial Overrides {!canEditFinances && "(Read Only)"}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Gross Fee (₹)</label>
                <input disabled={!canEditFinances} type="number" value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent disabled:opacity-70 disabled:bg-muted" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Scholarship %</label>
                <input disabled={!canEditFinances} type="number" min="0" max="100" value={form.scholarship_percent} onChange={e => setForm({...form, scholarship_percent: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent disabled:opacity-70 disabled:bg-muted" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Discount (₹)</label>
                <input disabled={!canEditFinances} type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent disabled:opacity-70 disabled:bg-muted" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border/20 text-xs">
              <span className="text-muted-foreground">Computed Net Fee:</span>
              <span className={`font-mono font-bold ${canEditFinances ? 'text-accent' : 'text-foreground'}`}>{fmtINR(computedNet)}</span>
            </div>
          </div>"""

content = content.replace(old_fin, new_fin)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching")
