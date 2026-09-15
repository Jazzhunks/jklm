with open("src/pages/erp/ErpIdCards.jsx", "r") as f:
    content = f.read()

# 1. Add toggleSelectAll
old_toggle = """  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };"""

new_toggle = """  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQueue.length && filteredQueue.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQueue.map(s => s.id)));
    }
  };"""

content = content.replace(old_toggle, new_toggle)

# 2. Add checkbox to table header
old_th = """<th className="w-[6%] px-5 py-3.5 text-center bg-muted"></th>"""

new_th = """<th className="w-[6%] px-5 py-3.5 text-center bg-muted cursor-pointer" onClick={toggleSelectAll} title="Select All">
                  <div className="flex justify-center items-center hover:text-foreground transition-colors">
                    {selectedIds.size === filteredQueue.length && filteredQueue.length > 0 ? (
                      <CheckSquare size={16} className="text-primary"/>
                    ) : (
                      <Square size={16} className="text-muted-foreground/50 hover:text-primary transition-colors"/>
                    )}
                  </div>
                </th>"""

content = content.replace(old_th, new_th)

with open("src/pages/erp/ErpIdCards.jsx", "w") as f:
    f.write(content)
print("Done patching ErpIdCards")
