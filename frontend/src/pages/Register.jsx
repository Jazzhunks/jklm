import { useState } from "react";
import { OtpInput } from "@/components/ui/OtpInput";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import GlassPanel from "@/components/GlassPanel";
import { CTAPrimary, Eyebrow } from "@/components/Cinematic";
import { useIsMobile } from "@/hooks/useIsMobile";
import HeroScene, { HeroSceneFallback } from "@/components/three/HeroScene";
import { User, EnvelopeSimple, Phone, Lock, GraduationCap, MapPin } from "@phosphor-icons/react";

export default function Register() {
  const { register, formatError } = useAuth();
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const [accountType, setAccountType] = useState("student");
  const [f, setF] = useState({ name:"", email:"", password:"", phone:"", school_name:"", address:"", district:"", school_type:"" });
  const [busy, setBusy] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [verifyError, setVerifyError] = useState("");


async function validatePhoneNumber(): Promise<boolean> {
    const digits = f.phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Mobile number must be exactly 10 digits.");
      return false;
    }
    setPhoneError("");
    return true;
  }

  const submit = async (e) => {
    e.preventDefault(); 
    
    // Validate phone number for all account types
    if (!(await validatePhoneNumber())) {
      return;
    }

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
  };

  const inputCls = "w-full pl-11 pr-4 py-3.5 rounded-xl glass text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/50 transition";

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2 relative overflow-hidden" data-testid="register-page">
      <div className="hidden lg:block relative overflow-hidden">
        {isMobile ? <HeroSceneFallback /> : <HeroScene />}
        <div className="absolute inset-0 flex items-end p-12">
          <div>
            <Eyebrow>Join the future</Eyebrow>
            <div className="font-display text-5xl xl:text-6xl font-light tracking-tight leading-tight mt-4">
              Begin your<br/><span className="font-medium italic text-accent">Northend journey.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 lg:p-12">
         <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md relative">
          <div className="lg:hidden mb-8">
            <Eyebrow>Create account</Eyebrow>
            <h1 className="font-display text-4xl font-light tracking-tight mt-4">Get started.</h1>
          </div>
          <GlassPanel elevated className="p-8">
            <div className="hidden lg:block mb-6">
              <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent">Create account</div>
              <h2 className="font-display text-3xl font-medium mt-2">Get started in 90s</h2>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
                <button type="button" onClick={() => setAccountType("student")} className={`py-2 rounded-md text-sm font-medium transition ${accountType === "student" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Student</button>
                <button type="button" onClick={() => setAccountType("school")} className={`py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-1 ${accountType === "school" ? "bg-background shadow-sm" : "text-muted-foreground"}`}><GraduationCap size={14}/> School</button>
              </div>
              <div className="relative">
                <User weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <input className={inputCls} placeholder="Full name" value={f.name} onChange={e=>setF({...f, name: e.target.value})} required data-testid="reg-name"/>
              </div>
              <div className="relative">
                <EnvelopeSimple weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <input className={inputCls} type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f, email: e.target.value})} required data-testid="reg-email"/>
              </div>
              <div className="relative">
                <Phone weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  value={f.phone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setF({...f, phone: digits});
                    setPhoneError(digits.length === 10 ? "" : "");
                  }}
                  onBlur={() => {
                    if (f.phone && f.phone.length !== 10) {
                      setPhoneError("Mobile number must be exactly 10 digits.");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  aria-invalid={Boolean(phoneError)}
                  data-testid="reg-phone"
                  required
                />
              </div>
              {phoneError && <p className="text-xs text-destructive -mt-1 ml-1">{phoneError}</p>}
              <div className="relative">
                <Lock weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <input className={inputCls} type="password" placeholder="Password (min 6 chars)" minLength={6} value={f.password} onChange={e=>setF({...f, password: e.target.value})} required data-testid="reg-password"/>
              </div>

              {accountType === "school" && (
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
                  <OtpInput value={otpCode} onChange={setOtpCode} disabled={busy} />
                  <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="text-xs text-muted-foreground hover:text-foreground underline">Change mobile number</button>
                </motion.div>
              )}

              <div className="pt-2">
                <CTAPrimary type="submit" className="w-full justify-center" data-testid="reg-submit" disabled={busy || (otpSent && otpCode.length !== 6)}>
                  {busy ? "Processing..." : (otpSent ? "Verify & Register" : "Create account")}
                </CTAPrimary>
              </div>
            </form>
            <p className="text-sm text-muted-foreground mt-6 text-center">Already have an account? <Link to="/login" className="text-accent font-bold hover:underline">Sign in</Link></p>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
