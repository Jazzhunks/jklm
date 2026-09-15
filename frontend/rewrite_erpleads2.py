with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

# Replace viewMode state and limit
content = content.replace('const [viewMode, setViewMode] = useState("kanban");', '')
content = content.replace('const limit = viewMode === "kanban" ? 100 : 25;', 'const limit = 25;')

# 1. Remove the "View Toggles" block
view_toggle_start = content.find('{/* View Toggles */}')
view_toggle_end = content.find('</div>', view_toggle_start) + 6
content = content[:view_toggle_start] + content[view_toggle_end:]

# 2. Remove Kanban View Area
# We find: {viewMode === "kanban" ? ( ... ) : ( {/* List/Table View */}
kanban_start = content.find('{viewMode === "kanban" ? (')
list_start = content.find('{/* List/Table View */}', kanban_start)
content = content[:kanban_start] + content[list_start:]

# 3. Fix the closing brace of the ternary operator
# We need to find the pagination footer and remove the trailing `)}` from the end of it.
footer_start = content.find('{/* Pagination Footer */}')
end_div = content.find('</div>\n      )}', footer_start)
if end_div != -1:
    content = content[:end_div] + '</div>\n' + content[end_div + 15:]

# 4. Remove {viewMode === "table" && ( wrapper around the table
table_wrap_start = content.find('{viewMode === "table" && (')
if table_wrap_start != -1:
    content = content[:table_wrap_start] + content[table_wrap_start + 26:]
    # And remove the closing )} for this wrapper, which is right before {/* Pagination Footer */}
    footer_idx = content.find('{/* Pagination Footer */}')
    closing_idx = content.rfind(')}', 0, footer_idx)
    if closing_idx != -1:
        content = content[:closing_idx] + content[closing_idx + 2:]

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done safely patching ErpLeads")
