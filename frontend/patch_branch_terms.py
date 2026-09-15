with open("src/pages/erp/ErpBranches.jsx", "r") as f:
    content = f.read()

old_ui = """            <h4 className="text-sm font-bold text-accent">Pine Labs EDC Integration</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Merchant ID</label>
                <input type="text" value={form.pinelabs_merchant_id} onChange={e => setForm({...form, pinelabs_merchant_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="e.g. 100021" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Secret Key</label>
                <input type="password" value={form.pinelabs_secret} onChange={e => setForm({...form, pinelabs_secret: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="API Secret" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">EDC Device IMEI</label>
                <input type="text" value={form.pinelabs_imei} onChange={e => setForm({...form, pinelabs_imei: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="e.g. 400123" />
              </div>"""

new_ui = """            <h4 className="text-sm font-bold text-accent">Pine Labs EDC Integration</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">POS ID (Merchant ID)</label>
                <input type="text" value={form.pinelabs_merchant_id} onChange={e => setForm({...form, pinelabs_merchant_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="e.g. POS ID" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Device IP / Secret</label>
                <input type="text" value={form.pinelabs_secret} onChange={e => setForm({...form, pinelabs_secret: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="e.g. 192.168.x.x" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Serial No / Hardware ID</label>
                <input type="text" value={form.pinelabs_imei} onChange={e => setForm({...form, pinelabs_imei: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="Serial Number" />
              </div>"""

content = content.replace(old_ui, new_ui)

with open("src/pages/erp/ErpBranches.jsx", "w") as f:
    f.write(content)
print("Done patching ErpBranches labels")
