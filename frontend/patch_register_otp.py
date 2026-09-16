with open("src/pages/Register.jsx", "r") as f:
    content = f.read()

state_add = """
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const { api } = useAuth();
"""
content = content.replace('  const [busy, setBusy] = useState(false);', '  const [busy, setBusy] = useState(false);\n' + state_add)

if 'import { api' not in content:
    content = content.replace('import { useAuth }', 'import { api } from "@/lib/api";\nimport { useAuth }')

old_submit = """  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = accountType === "school" ? { ...f } : { name: f.name, email: f.email, password: f.password, phone: f.phone };
      await register(payload);
      toast.success("Account created!");
      if (accountType === "school") {
        nav("/school-dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || err.message);
    } finally { setBusy(false); }
  };"""
  
new_submit = """  const submit = async (e) => {
    e.preventDefault(); 
    
    if (!otpSent) {
      if (!f.phone) {
        toast.error("Mobile number is required for verification.");
        return;
      }
      setBusy(true);
      try {
        await api.post("/auth/send-otp", { phone: f.phone, action: "register" });
        setOtpSent(true);
        toast.success("Verification code sent to your WhatsApp!");
      } catch (err) {
        toast.error(formatError(err.response?.data?.detail) || "Failed to send verification code.");
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      await api.post("/auth/verify-otp", { phone: f.phone, code: otpCode, action: "register" });
      
      const payload = accountType === "school" ? { ...f } : { name: f.name, email: f.email, password: f.password, phone: f.phone };
      await register(payload);
      toast.success("Account created successfully!");
      if (accountType === "school") {
        nav("/school-dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Invalid OTP or Registration Failed");
    } finally { setBusy(false); }
  };"""

content = content.replace(old_submit, new_submit)

# Let's replace the form tail safely
import re
start_idx = content.find('{accountType === "school" && (')
end_idx = content.find('</form>', start_idx)

tail_replacement = """{accountType === "school" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-2 border-t border-border">
                  <div className="relative">
                    <GraduationCap weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input className={inputCls} placeholder="School Name" value={f.school_name} onChange={e=>setF({...f, school_name: e.target.value})} required={accountType === "school"} data-testid="reg-school-name"/>
                  </div>
                  <div className="relative">
                    <MapPin weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input className={inputCls} placeholder="Address" value={f.address} onChange={e=>setF({...f, address: e.target.value})} data-testid="reg-address"/>
                  </div>
                  <div className="relative">
                    <MapPin weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input className={inputCls} placeholder="District" value={f.district} onChange={e=>setF({...f, district: e.target.value})} data-testid="reg-district"/>
                  </div>
                  <select className="w-full border border-border rounded-md px-3 py-3.5 bg-background text-sm" value={f.school_type} onChange={e=>setF({...f, school_type: e.target.value})} required={accountType === "school"} data-testid="reg-school-type">
                    <option value="">School Type</option>
                    <option value="middle">Middle</option>
                    <option value="high">High</option>
                    <option value="higher_secondary">Higher Secondary</option>
                  </select>
                </motion.div>
              )}

              {otpSent && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-4 border-t border-border">
                  <div className="text-[10px] uppercase tracking-widest text-accent font-bold">WhatsApp Verification</div>
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to {f.phone}.</p>
                  <input className={`${inputCls} text-center font-mono tracking-widest text-lg`} type="text" placeholder="------" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\\D/g, '').slice(0,6))} required maxLength={6} />
                  <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="text-xs text-muted-foreground hover:text-foreground underline">Change mobile number</button>
                </motion.div>
              )}

              <div className="pt-2">
                <CTAPrimary type="submit" className="w-full justify-center" data-testid="reg-submit" disabled={busy || (otpSent && otpCode.length !== 6)}>
                  {busy ? "Processing..." : (otpSent ? "Verify & Register" : "Create account")}
                </CTAPrimary>
              </div>
            """

content = content[:start_idx] + tail_replacement + content[end_idx:]

content = content.replace('<input className={inputCls} placeholder="Phone" value={f.phone} onChange={e=>setF({...f, phone: e.target.value})} data-testid="reg-phone"/>', '<input className={inputCls} placeholder="10-digit mobile number" value={f.phone} onChange={e=>setF({...f, phone: e.target.value})} data-testid="reg-phone" required />')

with open("src/pages/Register.jsx", "w") as f:
    f.write(content)
print("Done patching Register")
