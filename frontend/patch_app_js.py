with open("src/App.js", "r") as f:
    content = f.read()

import_statement = "import PublicStudentProfile from \"@/pages/PublicStudentProfile\";"
new_import = "import PublicStudentProfile from \"@/pages/PublicStudentProfile\";\nconst PublicReceipt = lazy(() => import(\"@/pages/PublicReceipt\"));"
content = content.replace(import_statement, new_import)

route_statement = "<Route path=\"student-profile/:enrollment_number\" element={<PublicStudentProfile />} />"
new_route = "<Route path=\"student-profile/:enrollment_number\" element={<PublicStudentProfile />} />\n              <Route path=\"r/:receiptNo\" element={<PublicReceipt />} />"
content = content.replace(route_statement, new_route)

with open("src/App.js", "w") as f:
    f.write(content)
print("Done")
