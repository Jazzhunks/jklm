with open("src/pages/erp/ErpDashboard.jsx", "r") as f:
    content = f.read()

# We just want to find the hardcoded "+12%" block and remove it entirely.
# Let's find exactly this block:
#       <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
#         <TrendingUp size={12} /> +12%
#       </div>

import re

# Replace the block with an empty string
new_content = re.sub(r'<div className="flex items-center gap-1 text-\[10px\] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">\s*<TrendingUp size=\{12\} /> \+12%\s*</div>', '', content)

with open("src/pages/erp/ErpDashboard.jsx", "w") as f:
    f.write(new_content)
print("Done patching Stat 2")
