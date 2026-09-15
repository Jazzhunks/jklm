with open("src/pages/erp/modals/ReceiptModal.jsx", "r") as f:
    content = f.read()

# Update the Header for Thermal
old_thermal_header = """                  <div className="font-bold text-sm tracking-tight">NORTHEND EDUCATIONAL WORLD</div>
                  <div className="text-[10px] text-slate-600">Coaching & Competitive Excellence</div>
                  <div className="text-[10px] text-slate-600">Parraypora, Srinagar - 190005</div>
                  <div className="text-[10px] font-bold text-slate-800">GSTIN: 01AAZFN0892N1ZL</div>"""
new_thermal_header = """                  <div className="font-bold text-sm tracking-tight">NORTHEND EDUCATIONAL WORLD</div>
                  <div className="text-[10px] text-slate-600">Unacademy Kashmir</div>
                  <div className="text-[10px] text-slate-600">Head Office: I.G Road Parraypora, Srinagar - 190005</div>
                  <div className="text-[10px] text-slate-600">info@northendedu.com | www.northendedu.com</div>
                  <div className="text-[10px] font-bold text-slate-800">GSTIN: 01AAZFN0892N1ZL</div>"""

content = content.replace(old_thermal_header, new_thermal_header)

# Scheme logic
logic_to_insert = """  // Map class to scheme
  const getSchemeName = (cClass, cCourse) => {
    const cl = String(cClass || "").toLowerCase();
    const co = String(cCourse || "").toUpperCase();
    const suffix = co.includes("NEET") ? " NEET" : (co.includes("IIT") || co.includes("JEE") ? " IIT" : "");
    if (cl.includes("8")) return "Beginner";
    if (cl.includes("9")) return "Adapt";
    if (cl.includes("10")) return "Elevate";
    if (cl.includes("11")) return "Growth" + suffix;
    if (cl.includes("12")) return "Excel" + suffix;
    if (cl.includes("drop") || cl.includes("13")) return "Conquer" + suffix;
    return cCourse || cl || "Academic Program";
  };
  
  const schemeName = getSchemeName(student?.current_class, student?.course?.title);
  
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const instNo = payment.installment_no || 1;
  const instStr = instNo <= 10 ? roman[instNo - 1] : String(instNo);
  
  const finalCourseTitle = `Unacademy offline Service fee for - ${schemeName} - Installment ${instStr}`;
"""

content = content.replace('  const courseTitle = payment.course_title || student?.course?.title || "Academic Program";', logic_to_insert)

# Replace instances of courseTitle
content = content.replace('{courseTitle}', '{finalCourseTitle}')
content = content.replace('Course: ${courseTitle}', 'Course: ${finalCourseTitle}')

with open("src/pages/erp/modals/ReceiptModal.jsx", "w") as f:
    f.write(content)
print("Done")
