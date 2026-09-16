with open("src/pages/erp/ErpStudents.jsx", "r") as f:
    content = f.read()

import re

# Insert handlePhoneBlur logic in CreateStudentModal
handle_blur = """  const handlePhoneBlur = async () => {
    if (form.contact_phone.length >= 10) {
      try {
        const res = await erp.lookupPhone(form.contact_phone);
        if (res.type === "student") {
          toast.error("A student is already enrolled with this number!");
        } else if (res.type === "lead" || res.type === "scholarship") {
          toast.success("Found existing record! Auto-filling details...");
          const d = res.data;
          setForm(f => ({
            ...f,
            full_name: f.full_name || d.name || d.full_name || "",
            contact_email: f.contact_email || d.email || "",
            address: f.address || d.address || "",
            parent_name: f.parent_name || d.parent_name || d.father_name || "",
            scholarship_percent: f.scholarship_percent || d.result_scholarship_percentage || 0
          }));
        }
      } catch (err) {
        console.error("Lookup failed", err);
      }
    }
  };

  const computeFinalFee = () => {"""

content = content.replace("  const computeFinalFee = () => {", handle_blur)

# Add onBlur to the phone input
old_phone = r'<input type="tel" required value=\{form\.contact_phone\} onChange=\{e => setForm\(f => \(\{ \.\.\.f, contact_phone: e\.target\.value \}\)\)\} placeholder="10-digit mobile number" className=\{inputCls\} />'
new_phone = '<input type="tel" required value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} onBlur={handlePhoneBlur} placeholder="10-digit mobile number" className={inputCls} />'
content = re.sub(old_phone, new_phone, content)

with open("src/pages/erp/ErpStudents.jsx", "w") as f:
    f.write(content)
print("Done patching ErpStudents.jsx for lookup")
