with open("src/pages/erp/modals/LeadEnrollModal.jsx", "r") as f:
    content = f.read()

# Make deposit > 0 required
old_input = '<input required type="number" value={form.deposit_amount} onChange={e => setForm({...form, deposit_amount: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded font-bold" placeholder="Amount collected today" />'
new_input = '<input required type="number" min="1" value={form.deposit_amount} onChange={e => setForm({...form, deposit_amount: e.target.value})} className="w-full p-2 text-sm border border-border bg-card rounded font-bold" placeholder="Amount collected today" />'
content = content.replace(old_input, new_input)

with open("src/pages/erp/modals/LeadEnrollModal.jsx", "w") as f:
    f.write(content)
print("Done patching LeadEnrollModal")
