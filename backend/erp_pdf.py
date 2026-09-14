import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

TEXT = HexColor("#0F172A")
MUTED = HexColor("#475569")
LINE = HexColor("#E2E8F0")

def _hr(c: canvas.Canvas, x1: float, x2: float, y: float, color=LINE):
    c.setStrokeColor(color)
    c.setLineWidth(0.6)
    c.line(x1, y, x2, y)

def get_amount_in_words(amount) -> str:
    """Converts a number to Indian Rupee words."""
    try:
        num = int(float(amount))
    except (ValueError, TypeError):
        return "—"
        
    if num == 0:
        return "Indian Rupee Zero Only"
        
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    
    def process_two_digits(n):
        if n < 20: return ones[n]
        return tens[n // 10] + (" " + ones[n % 10] if n % 10 != 0 else "")
        
    def process_three_digits(n):
        if n < 100: return process_two_digits(n)
        return ones[n // 100] + " Hundred" + (" " + process_two_digits(n % 100) if n % 100 != 0 else "")

    words = ""
    if num >= 10000000:
        words += process_two_digits(num // 10000000) + " Crore "
        num %= 10000000
    if num >= 100000:
        words += process_two_digits(num // 100000) + " Lakh "
        num %= 100000
    if num >= 1000:
        words += process_two_digits(num // 1000) + " Thousand "
        num %= 1000
    if num > 0:
        words += process_three_digits(num)
        
    return f"Indian Rupee {words.strip()} Only"

def fee_receipt_pdf(payment: dict, student: dict, branch: dict, course_title: str, prev_paid: float, total_fee: float) -> bytes:
    # --- DEFENSIVE CHECKS TO PREVENT 500 ERRORS ---
    payment = payment or {}
    student = student or {}
    branch = branch or {}
    course_title = course_title or "—"
    
    # Safely cast financial variables to floats (default to 0.0 if None or empty)
    try:
        prev_paid_val = float(prev_paid) if prev_paid else 0.0
    except (ValueError, TypeError):
        prev_paid_val = 0.0
        
    try:
        total_fee_val = float(total_fee) if total_fee else 0.0
    except (ValueError, TypeError):
        total_fee_val = 0.0
        
    try:
        item_amount = float(payment.get('amount') or 0.0)
    except (ValueError, TypeError):
        item_amount = 0.0
        
    try:
        base_amt = float(payment.get('base_amount') or 0.0)
    except (ValueError, TypeError):
        base_amt = 0.0
        
    try:
        cgst_val = float(payment.get('cgst') or 0.0)
    except (ValueError, TypeError):
        cgst_val = 0.0
        
    try:
        sgst_val = float(payment.get('sgst') or 0.0)
    except (ValueError, TypeError):
        sgst_val = 0.0
    # ----------------------------------------------

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    W, H = A4

    # ---- Header: Company Info ----
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(15 * mm, H - 20 * mm, "NORTHEND EDUCATIONAL WORLD".upper())
    
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(15 * mm, H - 25 * mm, "Head Office: I.G Road Parraypora, Srinagar - 190005")
    c.drawString(15 * mm, H - 30 * mm, "info@northendedu.com | www.northendedu.com")
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 16)
    c.drawRightString(W - 15 * mm, H - 20 * mm, "Tax Invoice")

    y = H - 35 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    
   # Splitting address across lines if needed, or printing direct
    raw_addr = branch.get("address", "") or ""
    
    # Skip "Place of Business" if Parraypora is in the address
    if "Parraypora" in raw_addr:
        addr = raw_addr
    else:
        addr = f"Place of Business: {raw_addr}"
    
    c.drawString(15 * mm, y, addr[:80])
    c.drawString(15 * mm, y - 4 * mm, addr[80:160])
    
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(15 * mm, y - 12 * mm, f"GSTIN {branch.get('gstin') or '01AAZFN0892N1ZL'}")

    _hr(c, 15 * mm, W - 15 * mm, y - 18 * mm)

    # ---- Bill To & Invoice Meta ----
    y2 = y - 26 * mm
    
    # Left Side: Bill To
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(15 * mm, y2, "Bill To")
    
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(15 * mm, y2 - 6 * mm, student.get("full_name") or "—")
    c.drawString(15 * mm, y2 - 11 * mm, student.get("contact_phone") or "—")

    # Right Side: Invoice Meta
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(W - 15 * mm, y2, f"Invoice No.: {payment.get('receipt_no') or '—'}")
    
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawRightString(W - 15 * mm, y2 - 5 * mm, f"Place Of Service: {branch.get('name') or 'Northend Centre'}")
    
    paid_at = str(payment.get("paid_at") or "")[:10]
    c.drawRightString(W - 15 * mm, y2 - 10 * mm, f"Invoice Date: {paid_at}")
    c.drawRightString(W - 15 * mm, y2 - 15 * mm, f"Due Date: {payment.get('next_due_date') or 'NIL'}")

    _hr(c, 15 * mm, W - 15 * mm, y2 - 22 * mm)

    # ---- Items Table ----
    y3 = y2 - 30 * mm
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(15 * mm, y3, "Item & Description")
    c.drawString(120 * mm, y3, "HSN/SAC")
    c.drawRightString(W - 15 * mm, y3, "Amount")
    
    _hr(c, 15 * mm, W - 15 * mm, y3 - 3 * mm)

    # Item Row
    y4 = y3 - 10 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(15 * mm, y4, course_title)
    c.drawString(120 * mm, y4, str(payment.get("hsn_sac") or "999293"))
    
    c.setFillColor(TEXT)
    c.drawRightString(W - 15 * mm, y4, f"{item_amount:,.2f}")

    _hr(c, 15 * mm, W - 15 * mm, y4 - 6 * mm)

    # ---- Totals & Bank Details Block ----
    y5 = y4 - 15 * mm
    
    # Left: Bank Details
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(15 * mm, y5, "Bank Details")
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(15 * mm, y5 - 5 * mm, f"Account Name: {payment.get('bank_account_name') or 'Northend Educational World'}")
    c.drawString(15 * mm, y5 - 10 * mm, f"Account Number: {payment.get('bank_account_number') or '0361010100002781'}")
    c.drawString(15 * mm, y5 - 15 * mm, f"IFSC Code: {payment.get('bank_ifsc') or 'JAKA0RAWWAL'}")
    
    # Left: Payment Meta & Words
    y_words = y5 - 30 * mm
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(15 * mm, y_words, "Mode of Payment:")
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(45 * mm, y_words, str(payment.get("mode") or "—"))
    
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(15 * mm, y_words - 6 * mm, "Total In Words:")
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    
    # Use the helper function to generate the words from the amount
    auto_words = get_amount_in_words(item_amount)
    c.drawString(42 * mm, y_words - 6 * mm, auto_words)

    # Right: Totals
    totals_x = W - 85 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    
    c.drawString(totals_x, y5, "Sub Total (Tax Inclusive)")
    c.drawRightString(W - 15 * mm, y5, f"INR {item_amount:,.2f}")
    
    c.drawString(totals_x, y5 - 6 * mm, "Total Taxable Amount")
    c.drawRightString(W - 15 * mm, y5 - 6 * mm, f"INR {base_amt:,.2f}")
    
    cgst_rate = payment.get('cgst_rate') or 9.0
    c.drawString(totals_x, y5 - 12 * mm, f"CGST ({cgst_rate}%)")
    c.drawRightString(W - 15 * mm, y5 - 12 * mm, f"INR {cgst_val:,.2f}")
    
    sgst_rate = payment.get('sgst_rate') or 9.0
    c.drawString(totals_x, y5 - 18 * mm, f"SGST ({sgst_rate}%)")
    c.drawRightString(W - 15 * mm, y5 - 18 * mm, f"INR {sgst_val:,.2f}")
    
    _hr(c, totals_x, W - 15 * mm, y5 - 22 * mm)
    
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(totals_x, y5 - 28 * mm, "Total")
    c.drawRightString(W - 15 * mm, y5 - 28 * mm, f"INR {item_amount:,.2f}")

    # Previously Paid
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(totals_x, y5 - 34 * mm, "Previously Paid")
    c.drawRightString(W - 15 * mm, y5 - 34 * mm, f"INR {prev_paid_val:,.2f}")

    # Balance Due Logic
    pending = max(total_fee_val - prev_paid_val - item_amount, 0)
    
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(totals_x, y5 - 40 * mm, "Balance Due")
    c.drawRightString(W - 15 * mm, y5 - 40 * mm, f"INR {pending:,.2f}" if pending > 0 else "NIL")

    # Next Due Date
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(totals_x, y5 - 46 * mm, "Next Due Date")
    c.drawRightString(W - 15 * mm, y5 - 46 * mm, str(payment.get("next_due_date") or "NIL"))

    # ---- Terms and Conditions & Disclaimer ----
    y6 = 45 * mm
    _hr(c, 15 * mm, W - 15 * mm, y6 + 5 * mm)
    
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(15 * mm, y6, "Terms & Conditions")
    
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(15 * mm, y6 - 5 * mm, "1. Refund, if any, shall be governed by the refund policy of NORTHEND EDUCATIONAL WORLD")
    c.drawString(15 * mm, y6 - 9 * mm, "2. GST under reverse charge is not payable on this invoice.")
    c.drawString(15 * mm, y6 - 13 * mm, "3. This is a computer-generated invoice and does not require a physical signature.")
    
    c.setFont("Helvetica-Oblique", 7.5)
    c.drawString(15 * mm, y6 - 22 * mm, "Disclaimer: This centre is independently owned and operated by NORTHEND EDUCATIONAL WORLD, an Authorised")
    c.drawString(15 * mm, y6 - 26 * mm, "Franchisee of Sorting Hat Solutions Pvt. Ltd. (Unacademy).")

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.getvalue()

def fee_receipt_thermal_pdf(
    payment: dict,
    student: dict,
    branch: dict,
    course_title: str,
    prev_paid: float,
    total_fee: float,
    width_mm: int = 80
) -> bytes:
    """Generates a POS thermal receipt PDF (80mm or 58mm roll)."""
    payment = payment or {}
    student = student or {}
    branch = branch or {}
    course_title = course_title or "—"

    try:
        prev_paid_val = float(prev_paid) if prev_paid else 0.0
    except (ValueError, TypeError):
        prev_paid_val = 0.0

    try:
        total_fee_val = float(total_fee) if total_fee else 0.0
    except (ValueError, TypeError):
        total_fee_val = 0.0

    try:
        item_amount = float(payment.get("amount") or 0.0)
    except (ValueError, TypeError):
        item_amount = 0.0

    try:
        base_amt = float(payment.get("base_amount") or 0.0)
    except (ValueError, TypeError):
        base_amt = 0.0

    try:
        cgst_val = float(payment.get("cgst") or 0.0)
    except (ValueError, TypeError):
        cgst_val = 0.0

    try:
        sgst_val = float(payment.get("sgst") or 0.0)
    except (ValueError, TypeError):
        sgst_val = 0.0

    w_val = 58 if width_mm <= 65 else 80
    h_val = 220 if w_val == 58 else 200

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w_val * mm, h_val * mm))
    W = w_val * mm
    H = h_val * mm
    margin = 4 * mm if w_val == 80 else 3 * mm

    def draw_dashed_hr(y_pos):
        c.setStrokeColor(HexColor("#475569"))
        c.setLineWidth(0.5)
        c.setDash(2, 2)
        c.line(margin, y_pos, W - margin, y_pos)
        c.setDash()

    def draw_row(y_pos, left_txt, right_txt, font_name="Helvetica", font_size=7.0, bold_val=False):
        c.setFont(font_name, font_size)
        c.setFillColor(TEXT)
        c.drawString(margin, y_pos, left_txt)
        if bold_val:
            c.setFont(font_name + "-Bold" if "Bold" not in font_name else font_name, font_size)
        c.drawRightString(W - margin, y_pos, str(right_txt))

    y = H - 6 * mm

    # Header
    c.setFont("Helvetica-Bold", 9.0 if w_val == 80 else 8.0)
    c.setFillColor(TEXT)
    c.drawCentredString(W / 2.0, y, "NORTHEND EDUCATIONAL WORLD")
    y -= 3.8 * mm

    c.setFont("Helvetica", 6.5)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2.0, y, "Coaching & Competitive Excellence")
    y -= 3.4 * mm

    b_name = branch.get("name") or "Head Office"
    b_addr = (branch.get("address") or "Parraypora, Srinagar - 190005")[:42]
    c.drawCentredString(W / 2.0, y, f"{b_name} - {b_addr}")
    y -= 3.2 * mm

    gstin = branch.get("gstin") or "01AAZFN0892N1ZL"
    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(TEXT)
    c.drawCentredString(W / 2.0, y, f"GSTIN: {gstin}")
    y -= 4.0 * mm

    draw_dashed_hr(y)
    y -= 3.5 * mm

    # Title
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(W / 2.0, y, "** TAX INVOICE / RECEIPT **")
    y -= 4.2 * mm

    # Metadata rows
    receipt_no = str(payment.get("receipt_no") or "—")
    paid_at = str(payment.get("paid_at") or "")[:10]
    draw_row(y, "Receipt No:", receipt_no, font_size=7)
    y -= 3.4 * mm
    draw_row(y, "Date:", paid_at, font_size=7)
    y -= 3.4 * mm

    student_no = str(payment.get("student_no") or student.get("student_no") or "—")
    student_name = str(student.get("full_name") or "—")
    draw_row(y, "Roll / Student ID:", student_no, font_size=7, bold_val=True)
    y -= 3.4 * mm
    draw_row(y, "Student Name:", student_name[:24], font_size=7, bold_val=True)
    y -= 3.4 * mm
    phone = str(student.get("contact_phone") or "—")
    draw_row(y, "Contact Phone:", phone, font_size=7)
    y -= 3.4 * mm
    draw_row(y, "Course Program:", course_title[:24], font_size=7)
    y -= 4.0 * mm

    draw_dashed_hr(y)
    y -= 3.5 * mm

    # Items
    c.setFont("Helvetica-Bold", 7)
    c.drawString(margin, y, "Particulars")
    c.drawRightString(W - margin, y, "Amount (INR)")
    y -= 3.5 * mm

    c.setFont("Helvetica", 7)
    c.drawString(margin, y, "Tuition & Academic Term")
    c.drawRightString(W - margin, y, f"{item_amount:,.2f}")
    y -= 3.4 * mm

    hsn = str(payment.get("hsn_sac") or "999293")
    c.setFont("Helvetica", 6)
    c.setFillColor(MUTED)
    c.drawString(margin, y, f"SAC Code: {hsn}")
    y -= 3.5 * mm

    draw_dashed_hr(y)
    y -= 3.5 * mm

    # GST Breakdown
    c.setFillColor(TEXT)
    draw_row(y, "Taxable Value:", f"{base_amt:,.2f}", font_size=7)
    y -= 3.2 * mm
    cgst_rate = payment.get("cgst_rate") or 9.0
    sgst_rate = payment.get("sgst_rate") or 9.0
    draw_row(y, f"CGST ({cgst_rate}%):", f"{cgst_val:,.2f}", font_size=7)
    y -= 3.2 * mm
    draw_row(y, f"SGST ({sgst_rate}%):", f"{sgst_val:,.2f}", font_size=7)
    y -= 3.5 * mm

    draw_dashed_hr(y)
    y -= 4.2 * mm

    # TOTAL PAID
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(TEXT)
    c.drawString(margin, y, "TOTAL RECEIVED:")
    c.drawRightString(W - margin, y, f"INR {item_amount:,.2f}")
    y -= 4.2 * mm

    # Words
    words = get_amount_in_words(item_amount)
    c.setFont("Helvetica-Oblique", 6)
    c.setFillColor(MUTED)
    c.drawString(margin, y, words[:45])
    if len(words) > 45:
        y -= 2.6 * mm
        c.drawString(margin, y, words[45:90])
    y -= 3.5 * mm

    draw_dashed_hr(y)
    y -= 3.5 * mm

    # Settlement & ledger
    mode = str(payment.get("mode") or "CASH").upper()
    draw_row(y, "Payment Intake:", mode, font_size=7, bold_val=True)
    y -= 3.2 * mm
    if payment.get("notes"):
        draw_row(y, "Txn Reference:", str(payment.get("notes"))[:22], font_size=6.5)
        y -= 3.2 * mm
    draw_row(y, "Previously Paid:", f"INR {prev_paid_val:,.2f}", font_size=7)
    y -= 3.2 * mm

    pending = max(total_fee_val - prev_paid_val - item_amount, 0)
    draw_row(y, "Balance Due:", f"INR {pending:,.2f}" if pending > 0 else "NIL", font_size=7, bold_val=True)
    y -= 3.2 * mm

    next_due = str(payment.get("next_due_date") or "NIL")
    draw_row(y, "Next Term Due:", next_due, font_size=7)
    y -= 4.0 * mm

    draw_dashed_hr(y)
    y -= 4.0 * mm

    # Thermal Footer
    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(TEXT)
    c.drawCentredString(W / 2.0, y, "Thank you for choosing Northend!")
    y -= 3.0 * mm
    c.setFont("Helvetica", 5.5)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2.0, y, "Fees once paid are non-refundable.")
    y -= 2.6 * mm
    c.drawCentredString(W / 2.0, y, "Computer generated thermal tax receipt.")
    y -= 2.6 * mm
    c.drawCentredString(W / 2.0, y, "No physical signature required.")

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.getvalue()