with open("src/pages/erp/ErpAttendance.jsx", "r") as f:
    content = f.read()

# 1. Add overrideSearch state
content = content.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n  const [overrideSearch, setOverrideSearch] = useState("");')

# 2. Add Search Bar to Desk Override Registry
old_override_header = """            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Force-verify a student directly from the directory if they forgot their printed hardware access cards profile.
            </p>
          </div>

          <div className="overflow-y-auto p-4 space-y-2.5 flex-1 min-h-0 custom-scrollbar">"""

new_override_header = """            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed mb-3">
              Force-verify a student directly from the directory if they forgot their printed hardware access cards profile.
            </p>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by name or student ID..." 
                value={overrideSearch}
                onChange={e => setOverrideSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-4 space-y-2.5 flex-1 min-h-0 custom-scrollbar">"""

content = content.replace(old_override_header, new_override_header)

# 3. Filter by overrideSearch
old_filter = """.filter(s => s.branch_id === branchId && s.status === "active")
                .map(st => ("""

new_filter = """.filter(s => s.branch_id === branchId && s.status === "active" && (!overrideSearch || (s.full_name || "").toLowerCase().includes(overrideSearch.toLowerCase()) || (s.student_no || "").toLowerCase().includes(overrideSearch.toLowerCase())))
                .map(st => ("""

content = content.replace(old_filter, new_filter)

with open("src/pages/erp/ErpAttendance.jsx", "w") as f:
    f.write(content)
print("Done patching ErpAttendance")
