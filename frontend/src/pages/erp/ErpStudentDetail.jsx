import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { erp, isSuper, isFinance, fmtINR, fmtDate } from "@/lib/erpApi";
import { formatError } from "@/lib/api";
import { api, API_BASE } from "@/lib/api";
import { 
  ArrowLeft, Plus, FileDown, Receipt as ReceiptIcon, Edit3, 
  X, Save, CheckCircle, Smartphone, Mail, MapPin, Milestone, User, Users, ClipboardList, Badge, Printer, Camera,
  Trash2, AlertTriangle
} from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ReceiptModal from "./modals/ReceiptModal";



function PaymentEditModal({ payment, onClose, onUpdated }) {
  const [form, setForm] = useState({
    amount: payment.amount,
    mode: payment.mode,
    paid_at: (payment.paid_at || "").slice(0, 16),
    transaction_ref: payment.transaction_ref || "",
    notes: payment.notes || "",
    apply_gst: (payment.cgst > 0)
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        mode: form.mode,
        paid_at: form.paid_at + ":00Z",
        transaction_ref: form.transaction_ref,
        notes: form.notes,
        apply_gst: form.apply_gst
      };
      await erp.updatePayment(payment.id, payload);
      toast.success("Payment record updated successfully.");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to update payment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !busy && onClose()}>
      <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 sticky top-0 rounded-t-2xl z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Edit3 size={16}/>
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Edit Transaction</h2>
              <div className="text-[10px] text-muted-foreground font-mono">{payment.receipt_no}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Amount (incl. GST)</label>
              <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Payment Mode</label>
              <select required value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent">
                <option value="cash">CASH</option>
                <option value="upi">UPI</option>
                <option value="online">ONLINE (PG)</option>
                <option value="cheque">CHEQUE</option>
                <option value="card">CARD / POS</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
              <input required type="datetime-local" value={form.paid_at} onChange={e => setForm({...form, paid_at: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Transaction Ref</label>
              <input type="text" value={form.transaction_ref} onChange={e => setForm({...form, transaction_ref: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground select-none cursor-pointer pt-2">
              <input type="checkbox" checked={form.apply_gst} onChange={e => setForm({...form, apply_gst: e.target.checked})} className="rounded text-accent focus:ring-accent w-4 h-4" />
              Apply 18% GST Compliance
            </label>
          </div>
        </form>
        
        <div className="p-4 border-t border-border bg-background/50 rounded-b-2xl flex gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={busy} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-xs uppercase font-bold text-muted-foreground hover:bg-muted transition">Cancel</button>
          <button type="submit" onClick={onSubmit} disabled={busy} className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-xs uppercase font-bold shadow-lg hover:brightness-110 transition disabled:opacity-50">
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErpStudentDetail() {

  const { id, student_no } = useParams();
  const studentIdentifier = student_no || id;
  const nav = useNavigate();
  const { erpUser } = useOutletContext();
  
  const [stmt, setStmt] = useState(null);
  const [course, setCourse] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [showPay, setShowPay] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropBlob, setCropBlob] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // { type: 'student'|'payment', id, label }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (stmt?.student?.branch_id) {
      erp.listStaff(stmt.student.branch_id).then(s => setCounsellors(s.filter(x => x.role === "counsellor"))).catch(() => {});
    }
  }, [stmt?.student?.branch_id]);

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      if (deleteModal.type === "student") {
        await erp.deleteStudent(deleteModal.id);
        toast.success(`Student ${deleteModal.label} purged successfully.`);
        nav("/erp/students");
      } else if (deleteModal.type === "payment") {
        await erp.deletePayment(deleteModal.id);
        toast.success(`Payment ${deleteModal.label} purged successfully.`);
        reload();
      }
      setDeleteModal(null);
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to execute delete operation");
    } finally {
      setDeleting(false);
    }
  };

  const reload = () => {
    erp.studentStatement(studentIdentifier)
      .then(setStmt)
      .catch(e => toast.error(formatError(e.response?.data?.detail) || "Failed to sync statement data"));
  };

  useEffect(() => { reload(); }, [studentIdentifier]);

  useEffect(() => {
    const timer = setInterval(() => { reload(); }, 30000);
    return () => clearInterval(timer);
  }, [reload]);

  useEffect(() => {
    if (stmt?.student?.course_id) {
      api.get(`/courses/${stmt.student.course_id}`)
        .then(r => setCourse(r.data))
        .catch(() => {});
    }
  }, [stmt?.student?.course_id]);

  if (!stmt) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-20 text-center animate-pulse">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-muted-foreground text-xs font-mono tracking-wider uppercase">Loading Student Dossier...</div>
      </div>
    );
  }

  const s = stmt.student;
  const canRecordPayment = erpUser.role !== "counsellor";

  const notifyParentViaWhatsApp = () => {
    if (!s.parent_phone && !s.contact_phone) {
      toast.error("No communication endpoints available for this record");
      return;
    }
    const txt = `Dear Parent,\n\nThis is an official tracking reminder from Northend Educational World regarding the pending academic fee installment balance of ${fmtINR(stmt.pending)} for your child ${s.full_name} (${s.student_no}).\n\nKindly clear the outstanding amount at your earliest convenience.\n\nThank you,\nAdministration Management Console`;
    const phone = (s.parent_phone || s.contact_phone).replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const queueIdCard = async () => {
    if (!s.luid || !s.enrollment_number) {
      toast.error("Student LUID and Enrollment Number are required before generating ID card");
      return;
    }
    try {
      await erp.updateStudent(s.id, { luid: s.luid, enrollment_number: s.enrollment_number });
      await api.post(`/erp/students/${encodeURIComponent(s.id)}/queue-id-card`);
      toast.success("Sent to ID card generation queue");
      nav("/erp/erpidcards");
    } catch (e) {
      toast.error(formatError(e.response?.data?.detail) || "Failed to queue ID card");
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const confirmCropAndUpload = async (blobToUpload) => {
    const targetBlob = blobToUpload || cropBlob;
    if (!targetBlob || !s) {
      toast.error("No image file ready to upload");
      return;
    }
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", targetBlob, `photo-${s.id}.png`);
      const { data } = await api.post(`/erp/students/${encodeURIComponent(s.id)}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Student photo uploaded and saved successfully");
      setShowEditProfile(false);
      reload();
    } catch (e) {
      toast.error(formatError(e.response?.data?.detail) || "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
      setCropping(false);
      setCropSrc(null);
      setCropBlob(null);
    }
  };


  return (
    <div className="space-y-6 animate-fadeIn" data-testid="erp-student-detail">
      {/* Navigation Row */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-2">
        <button 
          onClick={() => nav("/erp/students")} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" 
          data-testid="back-to-students"
        >
          <ArrowLeft size={14}/> Back to directory
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setShowEditProfile(true)} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
          >
            <Edit3 size={13}/> Edit Profile
          </button>
          {s.luid && s.enrollment_number && (
            <button 
              onClick={queueIdCard} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-primary hover:bg-primary/10 transition"
            >
              <Printer size={13}/> ID Card
            </button>
          )}
          {isSuper(erpUser) && (
            <button 
              onClick={() => setDeleteModal({ type: "student", id: s.id, label: s.student_no || s.full_name })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-500 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-rose-500/20 transition"
              data-testid="delete-student-btn"
            >
              <Trash2 size={13}/> Delete
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-elevated rounded-2xl border border-border overflow-hidden">
        <div className="bg-accent/5 border-b border-border px-6 py-5 flex items-start gap-5">
          <label className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted shrink-0 relative group/avatar cursor-pointer shadow-md" title="Click to change photo">
            {s.photo_url ? (
              <img
                src={s.photo_url.startsWith("data:") ? s.photo_url : `${API_BASE}/erp/students/${encodeURIComponent(s.id)}/photo?t=${Date.now()}`}
                alt=""
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <User size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <Camera size={18} />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-1">Change</span>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
          </label>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">{s.student_no}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                s.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : s.status === "temporary" ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : "bg-muted/50 text-muted-foreground border-border"
              }`} data-testid="student-status">
                {s.status}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-foreground mt-0.5">{s.full_name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5 flex flex-wrap gap-x-1">
              <span>{course?.title || "—"}</span>
              {s.batch && <span className="font-mono text-xs">· Batch: {s.batch}</span>}
              {s.batch_timing && <span className="font-mono text-xs">· {s.batch_timing}</span>}
              <span className="text-xs">· Admitted {fmtDate(s.admission_date)}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2 text-xs font-mono text-muted-foreground">
              {s.luid && <span className="px-2 py-0.5 bg-muted/50 rounded border border-border">LUID: {s.luid}</span>}
              {s.enrollment_number && <span className="px-2 py-0.5 bg-muted/50 rounded border border-border">ENROLL: {s.enrollment_number}</span>}
              {s.gender && <span className="px-2 py-0.5 bg-muted/50 rounded border border-border">{s.gender}</span>}
              {s.dob && <span className="px-2 py-0.5 bg-muted/50 rounded border border-border">DOB: {s.dob}</span>}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
          <FieldCard icon={Smartphone} label="Student Phone" v={s.contact_phone}/>
          <FieldCard icon={Mail} label="Email" v={s.contact_email}/>
          <FieldCard icon={Users} label="Parent / Guardian" v={s.parent_name}/>
          <FieldCard icon={Smartphone} label="Parent Phone" v={s.parent_phone}/>
          {s.school_institute && <FieldCard icon={Badge} label="School / Institute" v={s.school_institute}/>}
          {s.board && <FieldCard icon={ClipboardList} label="Board" v={s.board}/>}
          {s.current_class && <FieldCard icon={Milestone} label="Class" v={s.current_class}/>}
          {s.category && <FieldCard icon={Users} label="Category" v={s.category}/>}
          {s.course_duration && <FieldCard icon={Milestone} label="Duration" v={s.course_duration}/>}
          {s.emergency_phone && <FieldCard icon={Smartphone} label="Emergency Phone" v={s.emergency_phone}/>}
        </div>

        {(s.address || s.notes) && (
          <div className="border-t border-border/50 px-6 py-4 space-y-2">
            {s.address && (
              <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                <MapPin size={13} className="text-accent mt-0.5 shrink-0"/>
                <span>{s.address}</span>
              </div>
            )}
            {s.notes && (
              <div className="text-xs text-muted-foreground">
                <span className="font-bold uppercase tracking-wider">Notes: </span>{s.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Course Fee" value={fmtINR(stmt.total_fee)}/>
        <StatCard label="Scholarship" value={`${stmt.scholarship_percent}%`} sub={`Saved ${fmtINR(stmt.scholarship_amount)}`}/>
        <StatCard label="Flat Discount" value={fmtINR(stmt.discount)}/>
        <StatCard label="Net Payable" value={fmtINR(stmt.net_fee)} accent="text-sky-400"/>
        <StatCard 
          label="Outstanding" 
          value={fmtINR(stmt.pending)} 
          accent={stmt.pending > 0 ? "text-rose-600" : "text-emerald-600"} 
          testid="pending-amount"
          actionElement={stmt.pending > 0 ? (
            <button onClick={notifyParentViaWhatsApp} className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 underline block mt-1 hover:text-emerald-400">
              Nudge via WhatsApp
            </button>
          ) : null}
        />
      </div>

      {/* Payment History */}
      <div className="glass-elevated rounded-2xl overflow-hidden border border-border flex flex-col">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background/40 shrink-0">
          <h3 className="font-display font-medium text-base flex items-center gap-2">
            <ClipboardList size={17} className="text-accent" /> Payment History
          </h3>
          {canRecordPayment && (
            <button 
              onClick={() => setShowPay(true)} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-primary/90 shadow transition shrink-0" 
              data-testid="record-payment-btn"
            >
              <Plus size={14}/> Record Payment
            </button>
          )}
        </div>

        <div className="overflow-y-auto overflow-x-auto w-full custom-scrollbar" style={{maxHeight: 400}}>
          <table className="w-full text-sm border-collapse min-w-[680px]">
            <thead className="sticky top-0 z-10 bg-muted border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr className="text-left">
                <th className="px-5 py-3">Receipt</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3 text-right">Base</th>
                <th className="px-5 py-3 text-right">CGST</th>
                <th className="px-5 py-3 text-right">SGST</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 w-36"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background/20">
              {stmt.payments.map(p => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold">{p.receipt_no}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(p.paid_at)}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] font-bold text-muted-foreground uppercase">{p.mode}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-right text-xs text-muted-foreground">{fmtINR(p.base_amount)}</td>
                  <td className="px-5 py-3.5 font-mono text-right text-xs text-muted-foreground/60">{fmtINR(p.cgst)}</td>
                  <td className="px-5 py-3.5 font-mono text-right text-xs text-muted-foreground/60">{fmtINR(p.sgst)}</td>
                  <td className="px-5 py-3.5 font-mono text-right font-bold text-emerald-600">{fmtINR(p.amount)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="w-8 h-8 flex items-center justify-center text-accent bg-accent/10 border border-transparent hover:border-accent/20 hover:bg-accent/20 rounded-lg transition"
                        title="View Receipt"
                        data-testid={`receipt-modal-${p.id}`}
                      >
                        <Printer size={15}/>
                      </button>
                      <a 
                        href={`${API_BASE}/erp/receipts/${encodeURIComponent(p.receipt_no)}.pdf`} 
                        target="_blank" rel="noreferrer"
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-muted/10 border border-transparent hover:border-border hover:bg-muted/30 hover:text-foreground rounded-lg transition"
                        title="Download PDF"
                        data-testid={`download-receipt-${p.id}`}
                      >
                        <FileDown size={15}/>
                      </a>
                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPayment(p)}
                            className="w-8 h-8 flex items-center justify-center text-amber-500 bg-amber-500/10 border border-transparent hover:border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition"
                            title="Edit Transaction"
                          >
                            <Edit3 size={15}/>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: "payment", id: p.id, label: p.receipt_no })}
                            className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-500/10 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition"
                            title="Delete Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={15}/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {stmt.payments.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-14 text-center text-muted-foreground">
                    <ReceiptIcon size={28} className="mx-auto mb-3 opacity-30 text-accent"/>
                    <p className="text-sm">No payment records found for this student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {stmt.payments.length > 0 && (
          <div className="bg-muted border-t border-border px-5 py-3.5 flex items-center justify-between font-bold shrink-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Collected</span>
            <span className="font-mono text-lg text-emerald-600">{fmtINR(stmt.total_paid)}</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPay && (
        <RecordPaymentModal
          studentId={s.id}
          pending={stmt.pending}
          onClose={() => setShowPay(false)}
          onCreated={() => { setShowPay(false); reload(); toast.success("Payment recorded successfully."); }}
        />
      )}
      {showEditProfile && (
        <EditStudentProfileModal 
          student={s}
          erpUser={erpUser}
          counsellors={counsellors}
          onClose={() => setShowEditProfile(false)}
          onUpdated={() => { setShowEditProfile(false); reload(); }}
          onPhotoSelect={handlePhotoSelect}
        />
      )}
      {cropping && cropSrc && (
        <CropModal
          src={cropSrc}
          onClose={() => { setCropping(false); setCropSrc(null); setCropBlob(null); }}
          onConfirm={(blob) => { setCropBlob(blob); confirmCropAndUpload(blob); }}
        />
      )}
      {selectedReceipt && (
        <ReceiptModal payment={{...selectedReceipt, installment_no: (stmt?.payments?.slice().reverse().findIndex(p => p.id === selectedReceipt.id) ?? 0) + 1}} student={s} onClose={() => setSelectedReceipt(null)} />
      )}
      {editPayment && <PaymentEditModal payment={editPayment} onClose={() => setEditPayment(null)} onUpdated={reload} />}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl"><AlertTriangle size={22}/></div>
              <div>
                <h3 className="font-display font-medium text-lg text-foreground">Confirm Delete</h3>
                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Irreversible Action</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Permanently delete {deleteModal.type === "student" ? "student" : "payment"}{" "}
              <strong className="text-foreground font-mono">{deleteModal.label}</strong>?
              {deleteModal.type === "student" && " All records, payments, and attendance will be erased."}
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-rose-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13}/> {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function FieldCard({ icon: Icon, label, v }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon size={14} className="text-accent mt-0.5 opacity-60 shrink-0"/>}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
        <div className="text-sm mt-0.5 font-medium text-foreground">{v || "—"}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, actionElement, testid }) {
  return (
    <div className="glass-elevated rounded-2xl p-5 border border-border" data-testid={testid}>
      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl font-medium mt-2 tracking-tight ${accent || "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[11px] font-mono text-muted-foreground mt-1">{sub}</div>}
      {actionElement}
    </div>
  );
}

function EditStudentProfileModal({ student, onClose, onUpdated, onPhotoSelect, erpUser, counsellors = [] }) {
  const [form, setForm] = useState({
    full_name: student.full_name || "",
    contact_phone: student.contact_phone || "",
    contact_email: student.contact_email || "",
    parent_name: student.parent_name || "",
    parent_phone: student.parent_phone || "",
    parent_email: student.parent_email || "",
    emergency_phone: student.emergency_phone || "",
    batch: student.batch || "",
    batch_timing: student.batch_timing || "",
    course_duration: student.course_duration || "",
    address: student.address || "",
    luid: student.luid || "",
    enrollment_number: student.enrollment_number || "",
    status: student.status || "active",
    student_no: student.student_no || "",
    admission_date: student.admission_date ? student.admission_date.slice(0, 10) : "",
    gender: student.gender || "Male",
    dob: student.dob || "",
    current_class: student.current_class || "",
    school_institute: student.school_institute || "",
    board: student.board || "JKBOSE",
    category: student.category || "General",
    counsellor_id: student.counsellor_id || "",
    documents: student.documents ? JSON.stringify(student.documents) : "",
    notes: student.notes || "",
    total_fee: student.total_fee != null ? student.total_fee : "",
    scholarship_percent: student.scholarship_percent != null ? student.scholarship_percent : 0,
    discount: student.discount != null ? student.discount : 0,
  });
  const [busy, setBusy] = useState(false);

  const canEditFinances = isSuper(erpUser) || isFinance(erpUser);

  const computedNet = Math.max(0, Math.round(
    ((Number(form.total_fee) || 0) * (1 - (Number(form.scholarship_percent) || 0) / 100)) - (Number(form.discount) || 0)
  ));

  const submitProfileChanges = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (canEditFinances && form.total_fee !== "") {
        payload.total_fee = Number(form.total_fee);
        payload.scholarship_percent = Number(form.scholarship_percent);
        payload.discount = Number(form.discount);
      }
      if (form.documents) {
        try {
          payload.documents = JSON.parse(form.documents);
        } catch {
          payload.documents = [];
        }
      } else {
        payload.documents = [];
      }
      if (!form.notes) payload.notes = undefined;
      await erp.updateStudent(student.id, payload);
      toast.success("Student profile records updated successfully");
      onUpdated();
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to commit mutation array");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submitProfileChanges} className="bg-background border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent flex items-center gap-1">
              <Milestone size={12}/> Academic Registry Modification
            </div>
            <h3 className="font-display text-2xl font-medium mt-1">Edit Dossier State</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-muted/50 rounded-lg border border-transparent hover:border-border transition"><X size={18}/></button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[60vh] px-1 custom-scrollbar">
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Full Registration Name *</label>
            <input required type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Student Roll / ID</label>
              <input type="text" value={form.student_no} onChange={e => setForm({...form, student_no: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Admission Date</label>
              <input type="date" value={form.admission_date} onChange={e => setForm({...form, admission_date: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Board</label>
              <select value={form.board} onChange={e => setForm({...form, board: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none">
                <option value="JKBOSE">JKBOSE</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none">
                <option value="General">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">School / Institute</label>
              <input type="text" value={form.school_institute} onChange={e => setForm({...form, school_institute: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>

          {canEditFinances && (
            <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/5 space-y-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-accent">
                Fee Schedule & Financial Overrides
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Gross Fee (₹)</label>
                  <input type="number" value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Scholarship %</label>
                  <input type="number" min="0" max="100" value={form.scholarship_percent} onChange={e => setForm({...form, scholarship_percent: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Discount (₹)</label>
                  <input type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="w-full px-2 py-1.5 border border-border bg-background rounded-lg text-xs font-mono focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-accent/20 text-xs">
                <span className="text-muted-foreground">Computed Net Fee:</span>
                <span className="font-mono font-bold text-accent">{fmtINR(computedNet)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Contact Phone *</label>
              <input required type="text" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Email Address</label>
              <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Parent Guardian Name</label>
              <input type="text" value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Parent Mobile Handle</label>
              <input type="text" value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Parent Email</label>
              <input type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Emergency Phone</label>
              <input type="text" value={form.emergency_phone} onChange={e => setForm({...form, emergency_phone: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Batch Code</label>
              <input type="text" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">System Standing Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none">
                <option value="active">ACTIVE</option>
                <option value="inactive">INACTIVE</option>
                <option value="temporary">TEMPORARY</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Current Class</label>
              <input type="text" value={form.current_class} onChange={e => setForm({...form, current_class: e.target.value})} placeholder="e.g. 11th / NEET Repeater" className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Batch Timing</label>
              <select value={form.batch_timing} onChange={e => setForm({...form, batch_timing: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none">
                <option value="">Select Timing</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Course Duration</label>
              <input type="text" value={form.course_duration} onChange={e => setForm({...form, course_duration: e.target.value})} placeholder="e.g. 1 Year" className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Residential Address Mapping</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Student LUID</label>
              <input type="text" value={form.luid} onChange={e => setForm({...form, luid: e.target.value})} placeholder="Unique learner ID" className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Enrollment Number</label>
              <input type="text" value={form.enrollment_number} onChange={e => setForm({...form, enrollment_number: e.target.value})} placeholder="Official enrollment no" className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Assigned Counsellor</label>
              <select value={form.counsellor_id} onChange={e => setForm({...form, counsellor_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none">
                <option value="">— Select Counsellor —</option>
                {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Documents JSON</label>
              <textarea
                value={form.documents}
                onChange={e => setForm({...form, documents: e.target.value})}
                placeholder='[{"type":"aadhar","url":"..."}]'
                rows={2}
                className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Admin Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Internal admin remarks"
              rows={2}
              className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Profile Photo</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoSelect} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent" />
            <p className="text-[10px] text-muted-foreground mt-1">You will crop the photo to a circle before uploading.</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button disabled={busy} type="submit" className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2">
            <Save size={14}/> {busy ? "Authorizing State Changes..." : "Authorize Dataset Mutation"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-3 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function RecordPaymentModal({ studentId, pending, onClose, onCreated }) {
  const [form, setForm] = useState({ amount: "", mode: "cash", next_due_date: "", notes: "", apply_gst: true, transaction_ref: "" });
  const [busy, setBusy] = useState(false);

  const submitPaymentTransaction = async (e) => {
    e.preventDefault();
    const entryAmount = Number(form.amount);
    
    if (entryAmount <= 0) {
      toast.error("Collection metrics must exceed structural zero boundaries");
      return;
    }
    if (entryAmount > pending) {
      toast.error(`Collection values cannot break maximum outstanding cap boundary limits of ${fmtINR(pending)}`);
      return;
    }

    setBusy(true);
    try {
      await erp.createPayment({
        student_id: studentId,
        amount: entryAmount,
        mode: form.mode,
        apply_gst: form.apply_gst,
        next_due_date: form.next_due_date || null,
        notes: form.notes || null,
        transaction_ref: form.transaction_ref || undefined,
      });
      onCreated();
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to finalize cash token allocation mapping");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 grid place-items-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose} data-testid="record-payment-modal">
      <form onClick={e => e.stopPropagation()} onSubmit={submitPaymentTransaction} className="bg-background border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-accent flex items-center gap-1">
            <CheckCircle size={12}/> Cash Book Intake Layer
          </div>
          <h3 className="font-display text-2xl font-medium mt-1">Log Installment Collection</h3>
          <p className="text-sm text-muted-foreground mt-1">Outstanding sub-ledger collection boundary limit: <b className="text-rose-600 font-mono">{fmtINR(pending)}</b></p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Amount Settled (inclusive of GST) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground/50">₹</span>
              <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" className="w-full pl-7 pr-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-accent" data-testid="rp-amount"/>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Intake Mode *</label>
              <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none" data-testid="rp-mode">
                {["cash", "upi", "online", "cheque", "card"].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Next Term Due (Optional)</label>
              <input type="date" value={form.next_due_date} onChange={e => setForm({...form, next_due_date: e.target.value})} className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm font-mono text-foreground focus:outline-none" data-testid="rp-due"/>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Ref / Cheque / UTR No</label>
            <input type="text" value={form.transaction_ref} onChange={e => setForm({...form, transaction_ref: e.target.value})} placeholder="Optional UTR or Cheque #" className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent" data-testid="rp-ref"/>
          </div>
          
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 block">Transaction Context References</label>
            <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="e.g. Bank reference token string or check context hashes..." className="w-full px-3 py-2 border border-border bg-background/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent" data-testid="rp-notes"/>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground select-none cursor-pointer group" data-testid="rp-gst-toggle">
            <input type="checkbox" checked={form.apply_gst} onChange={e => setForm({...form, apply_gst: e.target.checked})} className="accent-primary rounded bg-background border-border" />
            <span className="group-hover:text-foreground transition-colors">Apply standardized split compliance taxation (CGST 9% + SGST 9%)</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button disabled={busy} type="submit" className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2" data-testid="rp-submit">
             Authorize Cash Intake State
          </button>
          <button type="button" onClick={onClose} className="px-4 py-3 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  if (aspect > mediaWidth / mediaHeight) {
    return { x: 0, y: (mediaHeight - mediaWidth / aspect) / 2, width: mediaWidth, height: mediaWidth / aspect };
  }
  return { x: (mediaWidth - mediaHeight * aspect) / 2, y: 0, width: mediaHeight * aspect, height: mediaHeight };
}

function getCroppedImg(image, pixelCrop) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.max(pixelCrop.width * scaleX, 1);
  canvas.height = Math.max(pixelCrop.height * scaleY, 1);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function CropModal({ src, onClose, onConfirm }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", x: 15, y: 15, width: 70, height: 70 });
  const [completedCrop, setCompletedCrop] = useState(null);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const minDim = Math.min(width, height);
    const initialCrop = {
      unit: "px",
      width: minDim * 0.8,
      height: minDim * 0.8,
      x: (width - minDim * 0.8) / 2,
      y: (height - minDim * 0.8) / 2,
    };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleConfirm = async () => {
    if (!imgRef.current) return;
    try {
      const targetCrop = completedCrop || {
        unit: "px",
        x: 0,
        y: 0,
        width: imgRef.current.width,
        height: imgRef.current.height,
      };
      const blob = await getCroppedImg(imgRef.current, targetCrop);
      if (blob) onConfirm(blob);
    } catch (err) {
      console.error("Crop error:", err);
    }
  };

  const handleUseOriginal = async () => {
    if (!imgRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) onConfirm(blob);
      }, "image/png");
    } catch (err) {
      console.error("Use original photo error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-medium">Crop Photo for Student ID Card</h3>
          <span className="text-[11px] text-muted-foreground font-mono">1:1 Circular ID Frame</span>
        </div>
        <div className="flex justify-center bg-muted/30 rounded-xl overflow-hidden p-2 border border-border">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img ref={imgRef} src={src} onLoad={onImageLoad} alt="Crop" style={{ maxHeight: "55vh" }} />
          </ReactCrop>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={handleConfirm} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition" data-testid="confirm-crop-btn">
            Confirm Crop & Save
          </button>
          <button onClick={handleUseOriginal} className="px-3 py-2.5 border border-border rounded-xl text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">
            Use Full Image
          </button>
          <button onClick={onClose} className="px-3 py-2.5 border border-border rounded-xl text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

