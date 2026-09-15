new_block = '''  return (
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
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 rounded-lg transition"
                        title="View Receipt"
                        data-testid={`receipt-modal-${p.id}`}
                      >
                        <Printer size={11}/> Receipt
                      </button>
                      <a 
                        href={`${API_BASE}/erp/payments/${p.id}/receipt`} 
                        target="_blank" rel="noreferrer"
                        className="p-1.5 hover:bg-muted/50 border border-transparent hover:border-border rounded-lg text-muted-foreground hover:text-foreground transition"
                        title="Download PDF"
                        data-testid={`download-receipt-${p.id}`}
                      >
                        <FileDown size={13}/>
                      </a>
                      {isSuper(erpUser) && (
                        <>
                          <button
                            onClick={() => setEditPayment(p)}
                            className="p-1.5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 rounded-lg text-amber-500 transition"
                            title="Edit Transaction"
                          >
                            <Edit3 size={13}/>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: "payment", id: p.id, label: p.receipt_no })}
                            className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg text-rose-500 transition"
                            title="Delete Transaction"
                            data-testid={`delete-payment-${p.id}`}
                          >
                            <Trash2 size={13}/>
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
        <ReceiptModal payment={selectedReceipt} student={s} onClose={() => setSelectedReceipt(null)} />
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
'''

with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    lines = f.readlines()

# lines 266..591 (0-indexed: 265..590) is the old block
new_lines = lines[:265] + [new_block + "\n"] + lines[591:]

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.writelines(new_lines)

print("Done")
