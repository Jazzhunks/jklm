import re

with open("src/pages/erp/modals/ProfileModal.jsx", "r") as f:
    content = f.read()

state_add = """  const [form, setForm] = useState({
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
"""
content = re.sub(r'  const \[form, setForm\] = useState\(\{.*?\n  \}\);', state_add, content, flags=re.DOTALL)

# Let's add sendOtp logic
funcs_add = """  const handleSendPhoneOtp = async () => {
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
"""
content = content.replace("  const handleSubmit = async (e) => {", funcs_add + "\n  const handleSubmit = async (e) => {")

# Modify payload in handleSubmit
old_payload = """      const payload = {
        name: form.name.trim(),
        receipt_print_size: form.receipt_print_size
      };
      if (form.password) {
        payload.password = form.password;
      }"""
new_payload = """      const payload = {
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
      }"""
content = content.replace(old_payload, new_payload)

# Replace the Account Details section to include Photo and Phone
old_account_section = """              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Email / Username (Read-Only)</label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ""}
                  className={`${inputCls} opacity-60 cursor-not-allowed`}
                />
              </div>"""

new_account_section = """              <div className="flex items-center gap-4 mb-4">
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
                  <input type="text" placeholder="------" value={form.otp_code} onChange={e => setForm({...form, otp_code: e.target.value.replace(/\D/g, '').slice(0,6)})} className={`${inputCls} font-mono tracking-widest`} maxLength={6} required />
                  <p className="text-[10px] text-muted-foreground mt-1">OTP sent to {form.phone} on WhatsApp.</p>
                </div>
              )}"""
content = content.replace(old_account_section, new_account_section)

# We need to add api import if not present
if 'import { api' not in content:
    content = content.replace('import { useAuth', 'import { api, formatError } from "@/lib/api";\nimport { useAuth')

# Clean up any \D backslash issues
content = content.replace('\\D', '\\\\D')

with open("src/pages/erp/modals/ProfileModal.jsx", "w") as f:
    f.write(content)
print("ProfileModal patched")
