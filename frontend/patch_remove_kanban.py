import re

with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Remove viewMode state
content = content.replace('const [viewMode, setViewMode] = useState("kanban");', '')

# Remove Kanban view block
kanban_pattern = r'\{\/\* Main View Area \*\/\}\s*\{viewMode === "kanban" \? \(.*?\)\s*:\s*\(\s*\{\/\* List/Table View \*\/\}'
content = re.sub(kanban_pattern, '{/* Main View Area */}\n      {/* List/Table View */}', content, flags=re.DOTALL)

# Remove the trailing `)}` from the viewMode ternary expression
end_pattern = r'\{\/\* Pagination Footer \*\/\}.*?</div>\s*</div>\s*\)\}'
content = re.sub(end_pattern, '{/* Pagination Footer */}</div>', content, flags=re.DOTALL)

# Let me just manually strip it with a Python script accurately instead of regex, or I can just write a clean script.
