with open("src/pages/erp/ErpLayout.jsx", "r") as f:
    content = f.read()

import re

# Add state
if "const [profileModalOpen, setProfileModalOpen]" not in content:
    content = content.replace("const [paletteOpen, setPaletteOpen] = useState(false);", "const [paletteOpen, setPaletteOpen] = useState(false);\n  const [profileModalOpen, setProfileModalOpen] = useState(false);")

# Add import
if "ProfileModal" not in content:
    content = content.replace('import { CommandPalette } from "@/components/CommandPalette";', 'import { CommandPalette } from "@/components/CommandPalette";\nimport ProfileModal from "./modals/ProfileModal";')

# Add icon import UserCog
if "UserCog" not in content:
    content = content.replace("Search, ", "Search, UserCog, ")

# Add button
old_button_area = """          <button 
            onClick={async () => { await logout(); nav("/login"); }}"""
new_button_area = """          <button 
            onClick={() => { setProfileModalOpen(true); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition duration-150"
          >
            <UserCog size={16} className="shrink-0"/> <span>Profile & Settings</span>
          </button>
          <button 
            onClick={async () => { await logout(); nav("/login"); }}"""
content = content.replace(old_button_area, new_button_area)

# Add Modal
old_outlet = "<Outlet context={{ erpUser, selectedBranchId, setSelectedBranchId, openCommandPalette: () => setPaletteOpen(true) }} />"
new_outlet = """<Outlet context={{ erpUser, selectedBranchId, setSelectedBranchId, openCommandPalette: () => setPaletteOpen(true) }} />
          {profileModalOpen && <ProfileModal onClose={() => setProfileModalOpen(false)} />}"""
content = content.replace(old_outlet, new_outlet)

with open("src/pages/erp/ErpLayout.jsx", "w") as f:
    f.write(content)
print("Done patching ErpLayout for profile button")
