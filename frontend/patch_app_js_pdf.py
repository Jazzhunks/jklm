with open("src/App.js", "r") as f:
    content = f.read()

import_statement = "const PublicReceipt = lazy(() => import('@/pages/PublicReceipt'));"
new_import = "const PublicReceipt = lazy(() => import('@/pages/PublicReceipt'));\nconst PublicPdfViewer = lazy(() => import('@/pages/PublicPdfViewer'));"
content = content.replace(import_statement, new_import)

route_statement = "<Route path=\"r/:receiptNo\" element={<PublicReceipt />} />"
new_route = "<Route path=\"r/:receiptNo\" element={<PublicReceipt />} />\n              <Route path=\"admit-card/:applicationNo\" element={<PublicPdfViewer type=\"admit-card\" />} />\n              <Route path=\"result-card/:applicationNo\" element={<PublicPdfViewer type=\"result-card\" />} />"
content = content.replace(route_statement, new_route)

with open("src/App.js", "w") as f:
    f.write(content)
print("Done patching App.js")
