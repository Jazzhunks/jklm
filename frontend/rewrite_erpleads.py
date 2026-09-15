with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Replace viewMode state and limit
content = content.replace('const [viewMode, setViewMode] = useState("kanban");', '')
content = content.replace('const limit = viewMode === "kanban" ? 100 : 25;', 'const limit = 25;')

# Remove viewMode toggler (lines 151-171 roughly)
# I'll just use a regex to remove the View Toggles block
import re
content = re.sub(r'\{\/\* View Toggles \*\/\}.*?<\/div>', '', content, flags=re.DOTALL)

# Remove the Kanban rendering block completely
# From {viewMode === "kanban" ? ( down to : ( {/* List/Table View */}
content = re.sub(r'\{viewMode === "kanban" \? \(.*?: \(\s*\{\/\* List/Table View \*\/\}\s*<div className="glass-elevated', '{/* List/Table View */}\n      <div className="glass-elevated', content, flags=re.DOTALL)

# Remove the ending `)}` for the ternary
content = re.sub(r'<\/div>\s*\)\}', '</div>', content)

# Remove the {viewMode === "table" && ( wrapper around the pagination controls, but wait, those were the table headers, let's just make it unconditional.
content = re.sub(r'\{viewMode === "table" && \((.*?)\)\}', r'\1', content, flags=re.DOTALL)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done rewriting ErpLeads")
