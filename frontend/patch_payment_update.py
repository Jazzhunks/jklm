with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

schema = """class PaymentCreate(BaseModel):
    student_id: str
    amount: float
    mode: Literal["cash", "upi", "online", "cheque", "card"]
    next_due_date: Optional[str] = None
    notes: Optional[str] = None
    transaction_ref: Optional[str] = None
    apply_gst: bool = True

class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    mode: Optional[Literal["cash", "upi", "online", "cheque", "card"]] = None
    paid_at: Optional[str] = None
    transaction_ref: Optional[str] = None
    notes: Optional[str] = None
    apply_gst: Optional[bool] = None
"""

content = content.replace(
    "class PaymentCreate(BaseModel):\n    student_id: str\n    amount: float\n    mode: Literal[\"cash\", \"upi\", \"online\", \"cheque\", \"card\"]\n    next_due_date: Optional[str] = None\n    notes: Optional[str] = None\n    transaction_ref: Optional[str] = None\n    apply_gst: bool = True\n",
    schema
)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
