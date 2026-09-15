with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Replace viewMode state and limit
content = content.replace('const [viewMode, setViewMode] = useState("kanban");', '')
content = content.replace('const limit = viewMode === "kanban" ? 100 : 25;', 'const limit = 25;')

# 1. Remove View Toggles
toggles_start = content.find('{/* View Toggles */}')
toggles_end = content.find('</div>', toggles_start) + 6
content = content[:toggles_start] + content[toggles_end:]

# 2. Extract Table View content and completely replace the Main View Area
main_start = content.find('{/* Main View Area */}')
table_start = content.find('<div className="glass-elevated', main_start)
table_end = content.find(' {/* Pagination Footer */}', table_start)

table_content = content[table_start:table_end]

# Now, we replace the entire block from Main View Area to just before Pagination Footer
footer_start = content.find('{/* Pagination Footer */}', main_start)

# The content to inject is just the table_content
new_main_area = "{/* Main View Area */}\n      " + table_content

content = content[:main_start] + new_main_area + content[footer_start:]

# 3. Clean up any lingering `)}` before `{/* Pagination Footer */}` if present due to ternary
# (If we extracted cleanly, it shouldn't have the `)}` because it was outside `table_content`)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLeads safely")
