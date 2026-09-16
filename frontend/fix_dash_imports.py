with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

if "import FeeMatrixConfigModal" not in content:
    content = content.replace('import { formatError, api, API_BASE } from "@/lib/api";', 'import { formatError, api, API_BASE } from "@/lib/api";\nimport FeeMatrixConfigModal from "./modals/FeeMatrixConfigModal";')

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(content)
print("Done fixing ErpDashboard imports")
