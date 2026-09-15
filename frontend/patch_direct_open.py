def patch_file(filepath, filename_var):
    with open(filepath, "r") as f:
        content = f.read()

    # Find the fetch block
    old_blob_logic = """        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);"""
    
    new_blob_logic = f"""        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        // Open PDF directly in the browser viewer (or trigger download on mobile)
        window.location.replace(url);"""
    
    content = content.replace(old_blob_logic, new_blob_logic)
    
    # We also want to change the rendering so we don't return the iframe.
    # While it's loading, it shows the spinner.
    # Once it replaces the location, the browser takes over.
    # We can just remove the iframe from the return just in case.
    if "PublicReceipt" in filepath:
        old_return = """  return (
    <div className="min-h-screen bg-slate-800 flex flex-col">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="font-bold tracking-widest uppercase text-sm">Northend Educational World</div>
        <div className="flex gap-3">
          <a 
            href={pdfUrl} 
            download={`Receipt-${receiptNo}.pdf`}
            className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded shadow transition"
          >
            Download PDF
          </a>
        </div>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8">
        <iframe 
          src={pdfUrl} 
          className="w-full h-full min-h-[80vh] rounded-xl shadow-2xl bg-white"
          title={`Receipt ${receiptNo}`}
        />
      </div>
    </div>
  );"""
    else:
        old_return = """  return (
    <div className="min-h-screen bg-slate-800 flex flex-col">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="font-bold tracking-widest uppercase text-sm">Northend Educational World</div>
        <div className="flex gap-3">
          <a 
            href={pdfUrl} 
            download={fileName}
            className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded shadow transition"
          >
            Download PDF
          </a>
        </div>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8">
        <iframe 
          src={pdfUrl} 
          className="w-full h-full min-h-[80vh] rounded-xl shadow-2xl bg-white"
          title={`${titleText} ${applicationNo}`}
        />
      </div>
    </div>
  );"""
        
    new_return = """  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-slate-600 font-medium tracking-wide">Opening Document...</p>
    </div>
  );"""
    
    content = content.replace(old_return, new_return)
    
    with open(filepath, "w") as f:
        f.write(content)

patch_file("src/pages/PublicReceipt.jsx", "`Receipt-${receiptNo}.pdf`")
patch_file("src/pages/PublicPdfViewer.jsx", "fileName")
print("Done direct open")
