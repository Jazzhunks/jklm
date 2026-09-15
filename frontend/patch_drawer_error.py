with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "r") as f:
    content = f.read()

content = content.replace(
    'onError: (err) => toast.error("Failed to log activity")',
    'onError: (err) => { console.error("Lead Error:", err); toast.error(err?.response?.data?.detail || err?.message || "Failed to log activity"); }'
)

with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "w") as f:
    f.write(content)
print("Done patching drawer error")
