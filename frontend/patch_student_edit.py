with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

old_btn = '''<button 
            onClick={() => setShowEditProfile(true)} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
          >
            <Edit3 size={13}/> Edit Profile
          </button>'''

new_btn = '''{isSuper(erpUser) && (
            <button 
              onClick={() => setShowEditProfile(true)} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
            >
              <Edit3 size={13}/> Edit Profile
            </button>
          )}'''

content = content.replace(old_btn, new_btn)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done patching ErpStudentDetail")
