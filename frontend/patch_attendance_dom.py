with open("src/pages/erp/ErpAttendance.jsx", "r") as f:
    content = f.read()

old_div = """          {scanning && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border">
              <div id="qr-reader-attendance" className="w-full"></div>
            </div>
          )}"""

new_div = """          <div className={scanning ? "mb-4 rounded-xl overflow-hidden border border-border bg-black" : "hidden"}>
            <div id="qr-reader-attendance" className="w-full"></div>
          </div>"""

content = content.replace(old_div, new_div)

with open("src/pages/erp/ErpAttendance.jsx", "w") as f:
    f.write(content)
