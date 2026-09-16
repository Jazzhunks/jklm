with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
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
old_phone = r'<input type="tel" required value=\{form\.contact_phone\} onChange=\{e => setForm\(\{\.\.\.form, contact_phone: e\.target\.value\}\)\} placeholder="10-digit mobile number" className=\{inputCls\} />'
new_phone = '<input type="tel" required value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} onBlur={handlePhoneBlur} placeholder="10-digit mobile number" className={inputCls} />'
content = re.sub(old_phone, new_phone, content)

# Remove required flag from parent_phone
# Actually, the user said "it not necessary to put parent email". They didn't say parent_phone shouldn't be required.
# Wait, "student mobile number and email id should be unique but parents number and email can be same and it not necessary to put parent email"
# Let me make parent_email optional if it was required.
# parent_email is ALREADY optional in UI: <input type="email" value={form.parent_email} />
# What about parent_phone? The user wrote: "parents number and email can be same" (i.e. not unique).
# The backend already doesn't check uniqueness for parent_phone and parent_email. So that part is already compliant.
# They didn't explicitly say parent_phone should be optional, just that the email is not necessary.
# Let's just make parent_email explicitly optional (which it is). Let's make sure it's optional in the backend as well (it is Optional[EmailStr] = None).

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done patching ErpDashboard.jsx for lookup")
