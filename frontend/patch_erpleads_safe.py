with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Replace viewMode state and limit
content = content.replace('const [viewMode, setViewMode] = useState("kanban");\n', '')
content = content.replace('const limit = viewMode === "kanban" ? 100 : 25;', 'const limit = 25;')

# Extract the parts we want to KEEP
header_end = content.find('{/* View Toggle */}')
if header_end == -1:
    print("Could not find View Toggle")
    exit(1)

table_start = content.find('<div className="glass-elevated rounded-2xl border border-border w-full overflow-hidden flex flex-col flex-1 min-h-0">')
if table_start == -1:
    print("Could not find Table Start")
    exit(1)

footer_start = content.find('{/* Pagination Footer */}')
if footer_start == -1:
    print("Could not find Footer Start")
    exit(1)

# Ensure no `)}` left before the footer from the table ternary
table_content = content[table_start:footer_start]
table_content = table_content.strip()
if table_content.endswith(')}'):
    table_content = table_content[:-2].strip()
if table_content.endswith(')'):
    table_content = table_content[:-1].strip()
if table_content.endswith('}'):
    table_content = table_content[:-1].strip()

# Create Lead button logic that was after View Toggle
create_btn_start = content.find('<button \n            onClick={() => setShowCreate(true)}', header_end)
if create_btn_start == -1:
    create_btn_start = content.find('<button\n            onClick={() => setShowCreate(true)}', header_end)
if create_btn_start == -1:
    create_btn_start = content.find('<button', header_end + 10)

create_btn_end = content.find('</div>\n      </div>', create_btn_start) + 19

# Stitch it together
new_content = content[:header_end] + content[create_btn_start:create_btn_end] + "\n\n      {/* Main View Area (List Only) */}\n      " + table_content + "\n\n      " + content[footer_start:]

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(new_content)
print("Done patching ErpLeads safely")
