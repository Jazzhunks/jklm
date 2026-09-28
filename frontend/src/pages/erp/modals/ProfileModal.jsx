import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  const inputCls = "w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2";
  const labelCls = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-md flex flex-col max-h-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-white/[0.08] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <User size={18} className="text-teal-800 dark:text-teal-300"/>
              Profile & Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Update your account details and preferences.
            </p>
          </div>
          <Button onClick={onClose} className="p-2 hover:bg-slate-200/50 dark:bg-white/[0.04] rounded-full transition text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200">
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Account Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-zinc-200 pb-2 border-b border-slate-200 dark:border-white/[0.08]/50">
                <User size={16} className="text-slate-500 dark:text-zinc-400" /> Account Details
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-200/50 dark:bg-white/[0.04] flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/[0.08] shrink-0">
                  {form.photo ? (
                    <img loading="lazy" src={form.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-slate-500 dark:text-zinc-400" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Profile Photo</label>
                  <label className="text-xs bg-slate-200/50 dark:bg-white/[0.04] hover:bg-slate-200/50 dark:bg-white/[0.04]/80 px-3 py-1.5 rounded-lg cursor-pointer transition inline-block">
                    {uploadingPhoto ? "Uploading..." : "Change Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Full Name</label>
                <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Email / Username (Read-Only)</label>
                <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" type="email" readOnly disabled value={user?.email || ""} className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>

              <div>
                <label className={labelCls}>Mobile Number</label>
                <div className="flex gap-2">
                  <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" type="text" placeholder="10-digit number" value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setPhoneOtpSent(false); }} className={inputCls} />
                  {form.phone !== user?.phone && !phoneOtpSent && (
                    <Button type="button" onClick={handleSendPhoneOtp} className="px-3 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-bold shrink-0 whitespace-nowrap">
                      Verify OTP
                    </Button>
                  )}
                </div>
              </div>

              {phoneOtpSent && (
                <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-accent/10 border border-accent/20 rounded-xl mt-2">
                  <label className={labelCls}>Enter 6-Digit OTP</label>
                  <input className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 focus:border-teal-600/50 px-3 py-2" type="text" placeholder="------" value={form.otp_code} onChange={e => setForm({...form, otp_code: e.target.value.replace(/\\D/g, '').slice(0,6)})} className={`${inputCls} font-mono tracking-widest`} maxLength={6} required />
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">OTP sent to {form.phone} on WhatsApp.</p>
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
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-zinc-200 pb-2 border-b border-slate-200 dark:border-white/[0.08]/50">
                <Printer size={16} className="text-slate-500 dark:text-zinc-400" /> Printing Preferences
              </div>
              
              <div>
                <label className={labelCls}>Default Receipt Size</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    onClick={() => setForm({...form, receipt_print_size: "A4"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.receipt_print_size === "A4" 
                        ? "border-teal-600 bg-teal-600/10 text-teal-800 dark:text-teal-300" 
                        : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111] text-slate-500 dark:text-zinc-400 hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="font-bold">A4 Size</span>
                    <span className="text-[10px] mt-1 opacity-80">Standard Laser/Inkjet</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setForm({...form, receipt_print_size: "80mm"})}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.receipt_print_size === "80mm" 
                        ? "border-teal-600 bg-teal-600/10 text-teal-800 dark:text-teal-300" 
                        : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111] text-slate-500 dark:text-zinc-400 hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="font-bold">80mm Thermal</span>
                    <span className="text-[10px] mt-1 opacity-80">POS Receipt Printer</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/[0.08] shrink-0 bg-slate-200/50 dark:bg-white/[0.04]/30 flex justify-end gap-3">
          <Button type="button" onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 w-full">
            Cancel
          </Button>
          <Button
            type="submit"
            form="profile-form"
            disabled={saving}
            className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
