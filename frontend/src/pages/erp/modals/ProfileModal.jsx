import React, { useState, useEffect } from "react";
import { X, Save, Printer, User, Key, Building2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileModal({ onClose }) {
  const { user, login, formatError } = useAuth(); // login actually updates user context in some implementations, wait, we might just have `checkAuth` or `refresh`
  
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    photo: user?.photo || "",
    password: "",
    confirmPassword: "",
    receipt_print_size: localStorage.getItem("receipt_print_size") || "A4",
    otp_code: "",
  });
  
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  
  const [saving, setSaving] = useState(false);

  // Sync back to local storage immediately when changed (for instant feel)
  useEffect(() => {
    localStorage.setItem("receipt_print_size", form.receipt_print_size);
  }, [form.receipt_print_size]);

  const handleSendPhoneOtp = async () => {
    if (!form.phone || form.phone === user?.phone) return;
    try {
      setSaving(true);
      await api.post("/auth/send-otp", { phone: form.phone, action: "update_phone" });
      setPhoneOtpSent(true);
      toast.success("OTP sent to new mobile number!");
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Failed to send OTP");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd);
      setForm(prev => ({ ...prev, photo: data.url }));
      toast.success("Photo uploaded successfully");
    } catch (err) {
      toast.error(formatError(err) || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        receipt_print_size: form.receipt_print_size,
        photo: form.photo
      };
      if (form.password) {
        payload.password = form.password;
      }
      if (form.phone !== user?.phone) {
        if (!form.otp_code) {
          toast.error("Please verify the new phone number with OTP first.");
          return;
        }
        payload.phone = form.phone;
        payload.otp_code = form.otp_code;
      }
      
      const res = await api.patch("/auth/profile", payload);
      // Ensure we trigger a re-render of user context if possible, or just window reload
      toast.success("Profile updated successfully!");
      onClose();
      // Optionally reload to fetch new name everywhere
      if (form.name.trim() !== user?.name) {
        window.location.reload();
      }
    } catch (err) {
      toast.error(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
  const labelCls = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <User size={18} className="text-primary"/>
              Profile & Settings
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Update your account details and preferences.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Account Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground pb-2 border-b border-border/50">
                <User size={16} className="text-muted-foreground" /> Account Details
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                  {form.photo ? (
                    <img src={form.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Profile Photo</label>
                  <label className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg cursor-pointer transition inline-block">
                    {uploadingPhoto ? "Uploading..." : "Change Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Email / Username (Read-Only)</label>
                <input type="email" readOnly disabled value={user?.email || ""} className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>

              <div>
                <label className={labelCls}>Mobile Number</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="10-digit number" value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setPhoneOtpSent(false); }} className={inputCls} />
                  {form.phone !== user?.phone && !phoneOtpSent && (
                    <button type="button" onClick={handleSendPhoneOtp} className="px-3 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-bold shrink-0 whitespace-nowrap">
                      Verify OTP
                    </button>
                  )}
                </div>
              </div>

              {phoneOtpSent && (
                <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-accent/10 border border-accent/20 rounded-xl mt-2">
                  <label className={labelCls}>Enter 6-Digit OTP</label>
                  <input type="text" placeholder="------" value={form.otp_code} onChange={e => setForm({...form, otp_code: e.target.value.replace(/\\D/g, '').slice(0,6)})} className={`${inputCls} font-mono tracking-widest`} maxLength={6} required />
                  <p className="text-[10px] text-muted-foreground mt-1">OTP sent to {form.phone} on WhatsApp.</p>
                </div>
              )}

              <div>
                <label className={labelCls}>New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className={inputCls}
                />
              </div>
              
              {form.password && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className={labelCls}>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                    className={inputCls}
                  />
                </div>
              )}
            </div>

            {/* Printer Settings */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground pb-2 border-b border-border/50">
                <Printer size={16} className="text-muted-foreground" /> Printing Preferences
              </div>
              
              <div>
                <label className={labelCls}>Default Receipt Size</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setForm({...form, receipt_print_size: "A4"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.receipt_print_size === "A4" 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="font-bold">A4 Size</span>
                    <span className="text-[10px] mt-1 opacity-80">Standard Laser/Inkjet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, receipt_print_size: "80mm"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.receipt_print_size === "80mm" 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="font-bold">80mm Thermal</span>
                    <span className="text-[10px] mt-1 opacity-80">POS Receipt Printer</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 border-t border-border shrink-0 bg-muted/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition">
            Cancel
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
