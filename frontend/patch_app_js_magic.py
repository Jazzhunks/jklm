with open("src/App.js", "r") as f:
    content = f.read()

import_statement = "const PublicPdfViewer = lazy(() => import('@/pages/PublicPdfViewer'));"
new_import = "const PublicPdfViewer = lazy(() => import('@/pages/PublicPdfViewer'));\nconst MagicProxy = lazy(() => import('@/pages/MagicProxy'));"
content = content.replace(import_statement, new_import)

route_statement = "<Route path=\"*\" element={<Navigate to=\"/\" replace />} />"
new_route = "<Route path=\":hash\" element={<MagicProxy />} />\n              <Route path=\"*\" element={<Navigate to=\"/\" replace />} />"
content = content.replace(route_statement, new_route)

with open("src/App.js", "w") as f:
    f.write(content)
print("Done patching App.js with MagicProxy")
