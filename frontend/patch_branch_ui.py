with open("src/pages/erp/ErpBranches.jsx", "r") as f:
    content = f.read()

# Add to form state in ErpBranches
old_form = """    state_code: branch?.state_code || "",
    manager_user_id: branch?.manager_user_id || ""
  });"""
new_form = """    state_code: branch?.state_code || "",
    manager_user_id: branch?.manager_user_id || "",
    pinelabs_merchant_id: branch?.pinelabs_merchant_id || "",
    pinelabs_secret: branch?.pinelabs_secret || "",
    pinelabs_imei: branch?.pinelabs_imei || "",
  });"""
content = content.replace(old_form, new_form)

# Add UI fields
old_ui = """            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Manager ID</label>
              <input type="text" value={form.manager_user_id} onChange={e => setForm({...form, manager_user_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="User ID of Branch Manager" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-4">"""

new_ui = """            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Manager ID</label>
              <input type="text" value={form.manager_user_id} onChange={e => setForm({...form, manager_user_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" placeholder="User ID of Branch Manager" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border mt-4 space-y-4">
            <h4 className="text-sm font-bold text-accent">Pine Labs EDC Integration</h4>
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
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-4">"""
content = content.replace(old_ui, new_ui)

with open("src/pages/erp/ErpBranches.jsx", "w") as f:
    f.write(content)
print("Done patching ErpBranches.jsx")
