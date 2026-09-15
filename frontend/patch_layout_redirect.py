with open("src/pages/erp/ErpLayout.jsx", "r") as f:
    content = f.read()

import re

new_hook = """  // Redirect gatekeeper away from root dashboard
  useEffect(() => {
    if (erpUser?.role === "attendance" && location.pathname === "/erp") {
      nav("/erp/erpattendance", { replace: true });
    }
  }, [erpUser, location.pathname, nav]);

  // Live clock"""

content = content.replace("  // Live clock", new_hook)

with open("src/pages/erp/ErpLayout.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLayout")
