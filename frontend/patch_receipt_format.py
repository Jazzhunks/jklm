with open("src/pages/erp/modals/ReceiptModal.jsx", "r") as f:
    content = f.read()

import re

# Update state initialization
old_state = 'const [format, setFormat] = useState("thermal-80"); // "a4" | "thermal-80" | "thermal-58"'
new_state = """  const savedSize = localStorage.getItem("receipt_print_size");
  const defaultFormat = savedSize === "A4" ? "a4" : savedSize === "58mm" ? "thermal-58" : "thermal-80";
  const [format, setFormat] = useState(defaultFormat); // "a4" | "thermal-80" | "thermal-58" """
content = content.replace(old_state, new_state)

with open("src/pages/erp/modals/ReceiptModal.jsx", "w") as f:
    f.write(content)
print("Done patching ReceiptModal for print size preference")
