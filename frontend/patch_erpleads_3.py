with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Add temperature and source to initial state
old_state = 'const [form, setForm] = useState({ name: "", phone: "", present_class: "", moving_to_class: "", remarks: "", branch_id: defaultBranchId || "" });'
new_state = 'const [form, setForm] = useState({ name: "", phone: "", present_class: "", moving_to_class: "", remarks: "", branch_id: defaultBranchId || "", temperature: "warm", source: "Manual" });'
content = content.replace(old_state, new_state)

# Add UI fields
old_remarks = """          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Initial Remarks / Notes
            </label>
            <textarea"""

new_remarks = """          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Lead Temp</label>
              <select value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none">
                <option value="hot">🔥 Hot</option>
                <option value="warm">☀️ Warm</option>
                <option value="cold">❄️ Cold</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs text-foreground focus:outline-none">
                <option value="Manual">Manual Entry</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Call">Inbound Call</option>
                <option value="Referral">Referral</option>
                <option value="Facebook">Facebook Ads</option>
                <option value="Google">Google Ads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Initial Remarks / Notes
            </label>
            <textarea"""

content = content.replace(old_remarks, new_remarks)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching CreateLeadModal")
