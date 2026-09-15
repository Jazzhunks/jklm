with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

old_call = """        is_thermal = (format or "").lower() == "thermal"
        if is_thermal:
            pdf_bytes = fee_receipt_thermal_pdf(p, s, b, c.get("title", "—"), prev_paid, net_fee, width_mm=width_mm or 80)
            fmt_tag = f"thermal-{width_mm or 80}mm"
        else:
            pdf_bytes = fee_receipt_pdf(p, s, b, c.get("title", "—"), prev_paid, net_fee)
            fmt_tag = "a4" """

new_call = """        is_thermal = (format or "").lower() == "thermal"
        
        # Calculate scheme name and installment
        from test_class_mapping import get_class_display
        scheme_name = get_class_display(s.get("current_class", ""), c.get("title", ""))
        roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
        inst_no = len(prev) + 1
        inst_str = roman[inst_no - 1] if inst_no <= 10 else str(inst_no)
        computed_course_title = f"Unacademy offline Service fee for - {scheme_name} - Installment {inst_str}"
        
        if is_thermal:
            pdf_bytes = fee_receipt_thermal_pdf(p, s, b, computed_course_title, prev_paid, net_fee, width_mm=width_mm or 80)
            fmt_tag = f"thermal-{width_mm or 80}mm"
        else:
            pdf_bytes = fee_receipt_pdf(p, s, b, computed_course_title, prev_paid, net_fee)
            fmt_tag = "a4" """

content = content.replace(old_call, new_call)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Updated erp_routes.py")
