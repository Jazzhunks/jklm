with open("src/pages/erp/ErpStudents.jsx", "r") as f:
    content = f.read()

old_dossier = """                        <Link 
                          to={`/erp/students/${encodeURIComponent(s.student_no || s.id)}`} 
                          className="inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-lg transition" 
                          data-testid={`view-student-${s.student_no || s.id}`}
                        >
                          Dossier →
                        </Link>"""
new_dossier = """                        <Link 
                          to={`/erp/students/${encodeURIComponent(s.student_no || s.id)}`} 
                          className="w-8 h-8 flex items-center justify-center text-accent bg-accent/10 border border-transparent hover:border-accent/20 hover:bg-accent/20 rounded-lg transition" 
                          title="View Dossier"
                          data-testid={`view-student-${s.student_no || s.id}`}
                        >
                          <ArrowUpRight size={15} />
                        </Link>"""

old_delete = """                          <button
                            onClick={() => setDeleteModal(s)}
                            className="inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition items-center gap-1.5"
                            title="Purge Student Record"
                            data-testid={`delete-student-${s.id}`}
                          >
                            <Trash2 size={13} /> Delete
                          </button>"""
new_delete = """                          <button
                            onClick={() => setDeleteModal(s)}
                            className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-500/10 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition"
                            title="Purge Student Record"
                            data-testid={`delete-student-${s.id}`}
                          >
                            <Trash2 size={15} />
                          </button>"""

content = content.replace(old_dossier, new_dossier).replace(old_delete, new_delete)

with open("src/pages/erp/ErpStudents.jsx", "w") as f:
    f.write(content)
print("Done")
