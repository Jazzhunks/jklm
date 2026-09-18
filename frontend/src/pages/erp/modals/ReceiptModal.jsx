import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { API_BASE, formatError } from "@/lib/api";
import { fmtINR, fmtDate } from "@/lib/erpApi";
import { Printer, Download, Share2, X, FileText, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function ReceiptModal({ payment, student, onClose }) {
    const savedSize = localStorage.getItem("receipt_print_size");
  const defaultFormat = savedSize === "A4" ? "a4" : savedSize === "58mm" ? "thermal-58" : "thermal-80";
  const [format, setFormat] = useState(defaultFormat); // "a4" | "thermal-80" | "thermal-58" 
  const printRef = useRef(null);

  if (!payment) return null;

  const receiptNo = payment.receipt_no || "—";
  const studentNo = payment.student_no || student?.student_no || "—";
  const studentName = payment.student_name || student?.full_name || "Student";
  // Map class to scheme
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

  const phone = payment.contact_phone || student?.contact_phone || "—";
  const amount = Number(payment.amount || 0);
  const baseAmount = Number(payment.base_amount || (amount / 1.18));
  const cgst = Number(payment.cgst || (amount - baseAmount) / 2);
  const sgst = Number(payment.sgst || (amount - baseAmount) / 2);
  const paidAt = payment.paid_at ? fmtDate(payment.paid_at) : fmtDate(new Date());
  const mode = (payment.mode || "cash").toUpperCase();
  const nextDueDate = payment.next_due_date ? fmtDate(payment.next_due_date) : "NIL";

  const pdfDownloadUrl = `${API_BASE}/erp/receipts/${encodeURIComponent(receiptNo)}.pdf?format=${
    format.startsWith("thermal") ? "thermal" : "a4"
  }&width_mm=${format === "thermal-58" ? 58 : 80}`;

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*UNACADEMY*\nOfficial Payment Receipt\n\nReceipt No: ${receiptNo}\nStudent ID: ${studentNo}\nStudent Name: ${studentName}\nCourse: ${finalCourseTitle}\nAmount Paid: ₹${amount.toLocaleString("en-IN")}\nDate: ${paidAt}\nPayment Mode: ${mode}\nNext Term Due: ${nextDueDate}\n\nDownload Digital Tax Receipt:\n${window.location.origin}/rec%2F${encodeURIComponent(receiptNo)}`;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const target = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rec%2F${encodeURIComponent(receiptNo)}`);
    toast.success("Receipt link copied to clipboard");
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-2 sm:p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose} data-testid="receipt-modal">
      {/* Print CSS specific to selected format */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: ${format === "a4" ? "100%" : format === "thermal-58" ? "58mm" : "80mm"} !important;
            margin: 0 !important;
            padding: ${format === "a4" ? "10mm" : "3mm"} !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          @page {
            size: ${format === "a4" ? "A4" : format === "thermal-58" ? "58mm auto" : "80mm auto"};
            margin: 0;
          }
        }
      `}</style>

      <div 
        onClick={e => e.stopPropagation()} 
        className="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent">Tax Invoice & Receipt Engine</div>
            <h2 className="font-display text-xl font-medium mt-0.5 text-foreground">
              Receipt #{receiptNo}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs uppercase tracking-wider font-bold shadow hover:opacity-90 transition"
              title="Direct Print (Thermal or A4)"
              data-testid="receipt-print-btn"
            >
              <Printer size={14} /> Print
            </Button>
            <a 
              href={pdfDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-background rounded-xl text-xs uppercase tracking-wider font-bold text-foreground hover:bg-muted/50 transition"
              data-testid="receipt-download-btn"
            >
              <Download size={14} /> PDF
            </a>
            <Button 
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-emerald-500/20 transition"
              title="Share receipt via WhatsApp"
              data-testid="receipt-whatsapp-btn"
            >
              <Share2 size={14} /> WhatsApp
            </Button>
            <Button 
              onClick={onClose} 
              className="p-1.5 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition ml-1"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="px-6 py-3 border-b border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider mr-1">Output Media:</span>
            <Button
              onClick={() => setFormat("a4")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                format === "a4" 
                  ? "bg-foreground text-background shadow" 
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
              data-testid="format-a4-btn"
            >
              📄 A4 Standard (Sheet)
            </Button>
            <Button
              onClick={() => setFormat("thermal-80")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                format === "thermal-80" 
                  ? "bg-foreground text-background shadow" 
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
              data-testid="format-thermal-80-btn"
            >
              🧾 Thermal POS 80mm (3")
            </Button>
            <Button
              onClick={() => setFormat("thermal-58")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                format === "thermal-58" 
                  ? "bg-foreground text-background shadow" 
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
              data-testid="format-thermal-58-btn"
            >
              🧾 Thermal POS 58mm (2")
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button onClick={handleCopyLink} className="inline-flex items-center gap-1 hover:text-foreground font-mono">
              <Copy size={12}/> Copy Link
            </Button>
            <span>•</span>
            <span className="font-mono">{format === "a4" ? "Tax Invoice (210×297mm)" : format === "thermal-80" ? "Continuous Roll (80mm)" : "Mini Roll (58mm)"}</span>
          </div>
        </div>

        {/* Scrollable Receipt Preview Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/20 flex justify-center items-start">
          <div 
            id="printable-receipt" 
            ref={printRef}
            className={`bg-white text-slate-900 transition-all duration-200 ${
              format === "a4"
                ? "w-full max-w-2xl min-h-[780px] p-8 rounded-xl shadow-xl border border-slate-200"
                : format === "thermal-80"
                ? "w-[340px] p-4 rounded-lg shadow-lg border border-slate-300 font-mono text-xs"
                : "w-[270px] p-3 rounded-lg shadow-lg border border-slate-300 font-mono text-[11px]"
            }`}
          >
            {format === "a4" ? (
              /* A4 FORMAL TAX INVOICE PREVIEW */
              <div className="space-y-6 text-slate-900 font-sans text-sm">
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div>
                    <h1 className="font-bold text-xl tracking-tight text-slate-900">UNACADEMY</h1>
                    <p className="text-xs text-slate-600 mt-1">Head Office: I.G Road Parraypora, Srinagar - 190005</p>
                    <p className="text-xs text-slate-600">info@unacademy.com | www.unacademy.com</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">GSTIN: 01AAZFN0892N1ZL</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-bold text-xs uppercase tracking-wider text-slate-800">
                      TAX INVOICE
                    </span>
                    <div className="mt-2 text-xs text-slate-600">
                      <div><strong className="text-slate-800">Invoice No:</strong> {receiptNo}</div>
                      <div><strong className="text-slate-800">Date:</strong> {paidAt}</div>
                      <div><strong className="text-slate-800">Due Date:</strong> {nextDueDate}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <div className="font-bold uppercase tracking-wider text-slate-500 mb-1 text-[10px]">Billed Student</div>
                    <div className="font-bold text-sm text-slate-900">{studentName}</div>
                    <div className="font-mono text-slate-700 mt-0.5">Roll No: {studentNo}</div>
                    <div className="text-slate-600 mt-0.5">Phone: {phone}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase tracking-wider text-slate-500 mb-1 text-[10px]">Academic Enrolment</div>
                    <div className="font-bold text-sm text-slate-900">{finalCourseTitle}</div>
                    <div className="text-slate-600 mt-0.5">Intake Mode: <strong className="text-slate-800 uppercase">{mode}</strong></div>
                    {payment.notes && <div className="text-slate-500 italic mt-0.5">Ref: {payment.notes}</div>}
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-[11px] uppercase tracking-wider text-slate-700 font-bold">
                      <th className="py-2">Particulars / Description</th>
                      <th className="py-2 text-center">HSN/SAC</th>
                      <th className="py-2 text-right">Taxable Amt</th>
                      <th className="py-2 text-right">CGST (9%)</th>
                      <th className="py-2 text-right">SGST (9%)</th>
                      <th className="py-2 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 font-medium text-slate-900">{finalCourseTitle} (Tuition Intake)</td>
                      <td className="py-3 text-center font-mono text-slate-600">999293</td>
                      <td className="py-3 text-right font-mono">₹{baseAmount.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono">₹{cgst.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono">₹{sgst.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">₹{amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between items-start pt-2 border-t border-slate-200">
                  <div className="max-w-[55%] text-xs space-y-2">
                    <div>
                      <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Official Bank Settlement</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 font-mono">
                        Unacademy<br />
                        A/C: 0361010100002781 | IFSC: JAKA0RAWWAL
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      * Fees once deposited are non-refundable. Computer generated invoice; signature not required.
                    </div>
                  </div>

                  <div className="w-56 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>₹{baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (9%):</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (9%):</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-300">
                      <span>Total Paid:</span>
                      <span className="text-emerald-700">₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1 text-[11px]">
                      <span>Next Due:</span>
                      <span>{nextDueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* THERMAL 80MM / 58MM POS RECEIPT PREVIEW */
              <div className="space-y-2.5 text-slate-900 leading-tight">
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <div className="font-bold text-sm tracking-tight">UNACADEMY</div>
                  <div className="text-[10px] text-slate-600">Unacademy Kashmir</div>
                  <div className="text-[10px] text-slate-600">Head Office: I.G Road Parraypora, Srinagar - 190005</div>
                  <div className="text-[10px] text-slate-600">info@unacademy.com | www.unacademy.com</div>
                  <div className="text-[10px] font-bold text-slate-800">GSTIN: 01AAZFN0892N1ZL</div>
                  <div className="text-[10px] font-bold tracking-widest mt-1 uppercase text-slate-700">** FEE RECEIPT **</div>
                </div>

                <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2">
                  <div className="flex justify-between">
                    <span>RECEIPT NO:</span>
                    <span className="font-bold">{receiptNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{paidAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROLL NO:</span>
                    <span className="font-bold text-slate-900">{studentNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STUDENT:</span>
                    <span className="font-bold">{studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PHONE:</span>
                    <span>{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COURSE:</span>
                    <span>{finalCourseTitle}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span>₹{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs text-slate-900 pt-1">
                    <span>TOTAL RECEIVED:</span>
                    <span className="text-emerald-700">₹{amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2">
                  <div className="flex justify-between">
                    <span>PAYMENT MODE:</span>
                    <span className="font-bold">{mode}</span>
                  </div>
                  {payment.notes && (
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>REF:</span>
                      <span className="truncate max-w-[150px]">{payment.notes}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>NEXT TERM DUE:</span>
                    <span>{nextDueDate}</span>
                  </div>
                </div>

                <div className="text-center pt-1 text-[9px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800">Thank you for studying at Unacademy!</div>
                  <div>Fees once deposited are non-refundable.</div>
                  <div>Computer generated thermal receipt.</div>
                  <div>No physical signature required.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Digital fiscal authorization valid across all Unacademy branch hubs.</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBrowserPrint}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-1.5 shadow"
            >
              <Printer size={13} /> Print on {format === "a4" ? "A4" : format === "thermal-80" ? "80mm POS" : "58mm POS"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  , document.body);
}
