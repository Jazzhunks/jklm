with open("src/App.js", "r") as f:
    content = f.read()

old_routes = """              <Route path="r/:receiptNo" element={<PublicReceipt />} />
              <Route path="admit-card/:applicationNo" element={<PublicPdfViewer type="admit-card" />} />
              <Route path="result-card/:applicationNo" element={<PublicPdfViewer type="result-card" />} />"""

new_routes = """              <Route path="rec/*" element={<PublicReceipt />} />
              <Route path="admt/*" element={<PublicPdfViewer type="admit-card" />} />
              <Route path="res/*" element={<PublicPdfViewer type="result-card" />} />"""

content = content.replace(old_routes, new_routes)

with open("src/App.js", "w") as f:
    f.write(content)
print("Done App.js")
