with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

old_code = """      await api.post(`/erp/students/${encodeURIComponent(s.id)}/queue-id-card`);
      toast.success("Sent to ID card generation queue");
      nav("/erp/erpidcards");"""

new_code = """      await api.post(`/erp/students/${encodeURIComponent(s.id)}/queue-id-card`);
      toast.success("ID card sent to bin");"""

content = content.replace(old_code, new_code)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching ErpStudentDetail queueIdCard")
