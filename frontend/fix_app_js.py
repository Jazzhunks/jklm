with open("src/App.js", "r") as f:
    content = f.read()

import_statement = "const PublicStudentProfile = lazy(() => import('@/pages/PublicStudentProfile'));"
new_import = "const PublicStudentProfile = lazy(() => import('@/pages/PublicStudentProfile'));\nconst PublicReceipt = lazy(() => import('@/pages/PublicReceipt'));"
content = content.replace(import_statement, new_import)

with open("src/App.js", "w") as f:
    f.write(content)
print("Done fixing App.js")
