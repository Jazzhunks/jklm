import re
with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Add payment_mode to ExpenseCreate
content = content.replace(
    '    expense_date: Optional[str] = None',
    '    expense_date: Optional[str] = None\n    payment_mode: Optional[Literal["cash", "online", "cheque", "card"]] = "online"'
)

# In create_expense, add payment_mode
content = content.replace(
    '            "expense_date": payload.expense_date or now_iso()[:10],',
    '            "expense_date": payload.expense_date or now_iso()[:10],\n            "payment_mode": payload.payment_mode,'
)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
