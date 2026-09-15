import re

with open("src/pages/erp/ErpExpenses.jsx", "r") as f:
    content = f.read()

# Add paymentMode state to CreateExpenseModal
content = content.replace(
    'const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));',
    'const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));\n  const [paymentMode, setPaymentMode] = useState("online");'
)

# Add paymentMode field in form
ui = """
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:border-accent outline-none">
              <option value="cash">Cash</option>
              <option value="online">Online / UPI</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </select>
          </div>
"""
content = content.replace(
    '<div>\n            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Bill/Invoice Context (Optional)</label>',
    ui + '<div>\n            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Bill/Invoice Context (Optional)</label>'
)

# Add it to the payload
content = content.replace(
    'amount: parseFloat(amount),\n        description,',
    'amount: parseFloat(amount),\n        description,\n        payment_mode: paymentMode,'
)

with open("src/pages/erp/ErpExpenses.jsx", "w") as f:
    f.write(content)
