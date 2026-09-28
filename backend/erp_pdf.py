import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

TEXT, MUTED, LINE = HexColor("#0F172A"), HexColor("#475569"), HexColor("#E2E8F0")

def _hr(c, x1, x2, y, color=LINE, dash=None):
    c.setStrokeColor(color); c.setLineWidth(0.6 if not dash else 0.5)
    if dash: c.setDash(*dash)
    c.line(x1, y, x2, y)
    if dash: c.setDash()

def get_amount_in_words(amt) -> str:
    try: n = int(float(amt))
    except (ValueError, TypeError): return "—"
    if n == 0: return "Indian Rupee Zero Only"
    o = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    t = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    def p2(x): return o[x] if x < 20 else t[x//10] + (" " + o[x%10] if x%10 else "")
    def p3(x): return p2(x) if x < 100 else o[x//100] + " Hundred" + (" " + p2(x%100) if x%100 else "")
    w = ""
    for d, s in [(10000000, "Crore"), (100000, "Lakh"), (1000, "Thousand")]:
        if n >= d: w += p2(n // d) + f" {s} "; n %= d
    if n: w += p3(n)
    return f"Indian Rupee {w.strip()} Only"

def _prep(payment, student, branch, course_title, prev_paid, total_fee):
    p, s, b = payment or {}, student or {}, branch or {}
    def f(v):
        try: return float(v or 0)
        except Exception: return 0.0
    return p, s, b, course_title or "—", f(prev_paid), f(total_fee), f(p.get('amount')), f(p.get('base_amount')), f(p.get('cgst')), f(p.get('sgst'))

def fee_receipt_pdf(payment: dict, student: dict, branch: dict, course_title: str, prev_paid: float, total_fee: float) -> bytes:
    p, s, b, ct, pp, tf, ia, ba, cg, sg = _prep(payment, student, branch, course_title, prev_paid, total_fee)
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=A4); W, H = A4
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 16)
    c.drawString(15*mm, H-20*mm, "NORTHEND EDUCATIONAL WORLD"); c.drawRightString(W-15*mm, H-20*mm, "Tax Invoice")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED)
    c.drawString(15*mm, H-25*mm, "Head Office: I.G Road Parraypora, Srinagar - 190005")
    c.drawString(15*mm, H-30*mm, "info@northendedu.com   | www.northendedu.com")
    addr = b.get("address", "") or ""; addr = addr if "Parraypora" in addr else f"Place of Business: {addr}"
    y = H-35*mm; c.drawString(15*mm, y, addr[:80]); c.drawString(15*mm, y-4*mm, addr[80:160])
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 9); c.drawString(15*mm, y-12*mm, f"GSTIN {b.get('gstin', '01AAZFN0892N1ZL')}")
    _hr(c, 15*mm, W-15*mm, y-18*mm)
    y2 = y-26*mm; c.drawString(15*mm, y2, "Bill To"); c.setFont("Helvetica", 9); c.setFillColor(MUTED)
    c.drawString(15*mm, y2-6*mm, s.get("full_name") or "—"); c.drawString(15*mm, y2-11*mm, s.get("contact_phone") or "—")
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 9); c.drawRightString(W-15*mm, y2, f"Invoice No.: {p.get('receipt_no', '—')}")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED)
    c.drawRightString(W-15*mm, y2-5*mm, f"Place Of Service: {b.get('name', 'Unacademy Centre')}")
    c.drawRightString(W-15*mm, y2-10*mm, f"Invoice Date: {str(p.get('paid_at', ''))[:10]}")
    c.drawRightString(W-15*mm, y2-15*mm, f"Due Date: {p.get('next_due_date', 'NIL')}")
    _hr(c, 15*mm, W-15*mm, y2-22*mm)
    y3 = y2-30*mm; c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 9)
    c.drawString(15*mm, y3, "Item & Description"); c.drawString(120*mm, y3, "HSN/SAC"); c.drawRightString(W-15*mm, y3, "Amount")
    _hr(c, 15*mm, W-15*mm, y3-3*mm)
    y4 = y3-10*mm; c.setFont("Helvetica", 9); c.setFillColor(MUTED)
    c.drawString(15*mm, y4, ct); c.drawString(120*mm, y4, str(p.get("hsn_sac", "999293")))
    c.setFillColor(TEXT); c.drawRightString(W-15*mm, y4, f"{ia:,.2f}")
    _hr(c, 15*mm, W-15*mm, y4-6*mm)
    y5 = y4-15*mm; c.setFont("Helvetica-Bold", 9); c.drawString(15*mm, y5, "Bank Details")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED)
    c.drawString(15*mm, y5-5*mm, f"Account Name: {p.get('bank_account_name', 'Northend Educational World')}")
    c.drawString(15*mm, y5-10*mm, f"Account Number: {p.get('bank_account_number', '0361010100002781')}")
    c.drawString(15*mm, y5-15*mm, f"IFSC Code: {p.get('bank_ifsc', 'JAKA0RAWWAL')}")
    yw = y5-30*mm; c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 9); c.drawString(15*mm, yw, "Mode of Payment:")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED); c.drawString(45*mm, yw, str(p.get("mode", "—")))
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 9); c.drawString(15*mm, yw-6*mm, "Total In Words:")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED); c.drawString(42*mm, yw-6*mm, get_amount_in_words(ia))
    tx = W-85*mm; c.drawString(tx, y5, "Sub Total (Tax Inclusive)"); c.drawRightString(W-15*mm, y5, f"INR {ia:,.2f}")
    c.drawString(tx, y5-6*mm, "Total Taxable Amount"); c.drawRightString(W-15*mm, y5-6*mm, f"INR {ba:,.2f}")
    c.drawString(tx, y5-12*mm, f"CGST ({p.get('cgst_rate', 9.0)}%)"); c.drawRightString(W-15*mm, y5-12*mm, f"INR {cg:,.2f}")
    c.drawString(tx, y5-18*mm, f"SGST ({p.get('sgst_rate', 9.0)}%)"); c.drawRightString(W-15*mm, y5-18*mm, f"INR {sg:,.2f}")
    _hr(c, tx, W-15*mm, y5-22*mm)
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 10); c.drawString(tx, y5-28*mm, "Total"); c.drawRightString(W-15*mm, y5-28*mm, f"INR {ia:,.2f}")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED); c.drawString(tx, y5-34*mm, "Previously Paid"); c.drawRightString(W-15*mm, y5-34*mm, f"INR {pp:,.2f}")
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 9); c.drawString(tx, y5-40*mm, "Balance Due")
    pd = max(tf - pp - ia, 0); c.drawRightString(W-15*mm, y5-40*mm, f"INR {pd:,.2f}" if pd > 0 else "NIL")
    c.setFont("Helvetica", 9); c.setFillColor(MUTED); c.drawString(tx, y5-46*mm, "Next Due Date"); c.drawRightString(W-15*mm, y5-46*mm, str(p.get("next_due_date", "NIL")))
    y6 = 45*mm; _hr(c, 15*mm, W-15*mm, y6+5*mm)
    c.setFillColor(TEXT); c.setFont("Helvetica-Bold", 8); c.drawString(15*mm, y6, "Terms & Conditions")
    c.setFont("Helvetica", 8); c.setFillColor(MUTED)
    c.drawString(15*mm, y6-5*mm, "1. Refund, if any, shall be governed by the refund policy of UNACADEMY")
    c.drawString(15*mm, y6-9*mm, "2. GST under reverse charge is not payable on this invoice.")
    c.drawString(15*mm, y6-13*mm, "3. This is a computer-generated invoice and does not require a physical signature.")
    c.setFont("Helvetica-Oblique", 7.5)
    c.drawString(15*mm, y6-22*mm, "Disclaimer: This centre is independently owned and operated by Northend Educational World, an Authorised")
    c.drawString(15*mm, y6-26*mm, "Franchisee of Sorting Hat Solutions Pvt. Ltd. (Unacademy).")
    c.showPage(); c.save(); buf.seek(0)
    return buf.getvalue()

def fee_receipt_thermal_pdf(payment: dict, student: dict, branch: dict, course_title: str, prev_paid: float, total_fee: float, width_mm: int = 80) -> bytes:
    p, s, b, ct, pp, tf, ia, ba, cg, sg = _prep(payment, student, branch, course_title, prev_paid, total_fee)
    wv = 58 if width_mm <= 65 else 80; hv = 220 if wv == 58 else 200
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=(wv*mm, hv*mm)); W, H = wv*mm, hv*mm; m = 4*mm if wv == 80 else 3*mm
    def _dhr(y): _hr(c, m, W-m, y, HexColor("#475569"), (2, 2))
    def _dr(y, l, r, fn="Helvetica", fs=7.0, b=False):
        c.setFont(fn, fs); c.setFillColor(TEXT); c.drawString(m, y, l)
        if b: c.setFont(f"{fn}-Bold" if "Bold" not in fn else fn, fs)
        c.drawRightString(W-m, y, str(r))
    y = H-6*mm; c.setFont("Helvetica-Bold", 9.0 if wv == 80 else 8.0); c.setFillColor(TEXT); c.drawCentredString(W/2.0, y, "Northend Educational World")
    y -= 3.8*mm; c.setFont("Helvetica", 6.5); c.setFillColor(MUTED); c.drawCentredString(W/2.0, y, "Unacademy Kashmir")
    y -= 3.4*mm; c.drawCentredString(W/2.0, y, "Head Office: I.G Road Parraypora, Srinagar - 190005")
    y -= 3.2*mm; c.drawCentredString(W/2.0, y, "info@northendedu.com | www.northendedu.com")
    y -= 3.2*mm; c.setFont("Helvetica-Bold", 6.5); c.setFillColor(TEXT); c.drawCentredString(W/2.0, y, f"GSTIN: {b.get('gstin', '01AAZFN0892N1ZL')}")
    y -= 4.0*mm; _dhr(y); y -= 3.5*mm; c.setFont("Helvetica-Bold", 8); c.drawCentredString(W/2.0, y, "** TAX INVOICE / RECEIPT **")
    y -= 4.2*mm; _dr(y, "Receipt No:", p.get("receipt_no", "—"), fs=7); y -= 3.4*mm; _dr(y, "Date:", str(p.get("paid_at", ""))[:10], fs=7)
    y -= 3.4*mm; _dr(y, "Roll / Student ID:", p.get("student_no") or s.get("student_no", "—"), fs=7, b=True)
    y -= 3.4*mm; _dr(y, "Student Name:", str(s.get("full_name", "—"))[:24], fs=7, b=True)
    y -= 3.4*mm; _dr(y, "Contact Phone:", s.get("contact_phone", "—"), fs=7)
    y -= 3.4*mm; _dr(y, "Course Program:", ct[:24], fs=7); y -= 4.0*mm; _dhr(y); y -= 3.5*mm
    c.setFont("Helvetica-Bold", 7); c.drawString(m, y, "Particulars"); c.drawRightString(W-m, y, "Amount (INR)"); y -= 3.5*mm
    c.setFont("Helvetica", 7); c.drawString(m, y, "Tuition & Academic Term"); c.drawRightString(W-m, y, f"{ia:,.2f}"); y -= 3.4*mm
    c.setFont("Helvetica", 6); c.setFillColor(MUTED); c.drawString(m, y, f"SAC Code: {p.get('hsn_sac', '999293')}"); y -= 3.5*mm; _dhr(y); y -= 3.5*mm
    c.setFillColor(TEXT); _dr(y, "Taxable Value:", f"{ba:,.2f}", fs=7); y -= 3.2*mm
    _dr(y, f"CGST ({p.get('cgst_rate', 9.0)}%):", f"{cg:,.2f}", fs=7); y -= 3.2*mm; _dr(y, f"SGST ({p.get('sgst_rate', 9.0)}%):", f"{sg:,.2f}", fs=7); y -= 3.5*mm
    _dhr(y); y -= 4.2*mm; c.setFont("Helvetica-Bold", 8.5); c.setFillColor(TEXT); c.drawString(m, y, "TOTAL RECEIVED:"); c.drawRightString(W-m, y, f"INR {ia:,.2f}"); y -= 4.2*mm
    cw = get_amount_in_words(ia); c.setFont("Helvetica-Oblique", 6); c.setFillColor(MUTED); c.drawString(m, y, cw[:45])
    if len(cw) > 45: y -= 2.6*mm; c.drawString(m, y, cw[45:90])
    y -= 3.5*mm; _dhr(y); y -= 3.5*mm
    _dr(y, "Payment Intake:", str(p.get("mode", "CASH")).upper(), fs=7, b=True); y -= 3.2*mm
    if p.get("notes"): _dr(y, "Txn Reference:", str(p.get("notes"))[:22], fs=6.5); y -= 3.2*mm
    _dr(y, "Previously Paid:", f"INR {pp:,.2f}", fs=7); y -= 3.2*mm
    pd = max(tf - pp - ia, 0); _dr(y, "Balance Due:", f"INR {pd:,.2f}" if pd > 0 else "NIL", fs=7, b=True); y -= 3.2*mm
    _dr(y, "Next Term Due:", str(p.get("next_due_date", "NIL")), fs=7); y -= 4.0*mm; _dhr(y); y -= 4.0*mm
    c.setFont("Helvetica-Bold", 6.5); c.setFillColor(TEXT); c.drawCentredString(W/2.0, y, "Thank you for choosing Unacademy!"); y -= 3.0*mm
    c.setFont("Helvetica", 5.5); c.setFillColor(MUTED); c.drawCentredString(W/2.0, y, "Fees once paid are non-refundable."); y -= 2.6*mm
    c.drawCentredString(W/2.0, y, "Computer generated thermal tax receipt."); y -= 2.6*mm; c.drawCentredString(W/2.0, y, "No physical signature required.")
    c.showPage(); c.save(); buf.seek(0)
    return buf.getvalue()
