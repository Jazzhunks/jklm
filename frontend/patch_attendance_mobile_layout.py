with open("src/pages/erp/ErpAttendance.jsx", "r") as f:
    content = f.read()

# 1. Main wrapper
old_wrapper = 'className="space-y-6 h-[calc(100vh-120px)] flex flex-col min-h-0 animate-fadeIn relative"'
new_wrapper = 'className="space-y-6 lg:h-[calc(100vh-120px)] min-h-[calc(100vh-120px)] flex flex-col min-h-0 animate-fadeIn relative"'
content = content.replace(old_wrapper, new_wrapper)

# 2. Stream panel
old_stream = 'className="glass-elevated rounded-2xl border border-border overflow-hidden flex flex-col lg:col-span-2 min-h-0 bg-background/10"'
new_stream = 'className="glass-elevated rounded-2xl border border-border overflow-hidden flex flex-col lg:col-span-2 min-h-[500px] lg:min-h-0 bg-background/10"'
content = content.replace(old_stream, new_stream)

# 3. Desk Override panel
old_override = 'className="glass-elevated rounded-2xl border border-border overflow-hidden flex flex-col min-h-0 bg-background/10"'
new_override = 'className="glass-elevated rounded-2xl border border-border overflow-hidden flex flex-col min-h-[400px] lg:min-h-0 bg-background/10"'
content = content.replace(old_override, new_override)

with open("src/pages/erp/ErpAttendance.jsx", "w") as f:
    f.write(content)
