import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OtpInput } from "@/components/ui/OtpInput";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import GlassPanel from "@/components/GlassPanel";
import { CTAPrimary, Eyebrow } from "@/components/Cinematic";
import { useIsMobile } from "@/hooks/useIsMobile";
import HeroScene, { HeroSceneFallback } from "@/components/three/HeroScene";
import { Lock, EnvelopeSimple, Eye, EyeSlash, WarningCircle, Sparkle } from "@phosphor-icons/react";

const ERP_ROLES = ["super_admin", "center_manager", "accountant", "counsellor", "attendance"];

const ALLOWED_REDIRECTS = new Set([
  "/dashboard",
  "/admin",
  "/erp",
  "/profile",
  "/settings"
]);

export default function Login() {
  const { login, formatError } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [params] = useSearchParams();
  const isMobile = useIsMobile();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [useOtp, setUseOtp] = useState(true);
  const [authMode, setAuthMode] = useState("password");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const { otpLogin } = useAuth();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const abortControllerRef = useRef(null);
  const lastAttemptRef = useRef(0);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.posthog) {
        if (typeof window.posthog.sessionRecording === "object" && typeof window.posthog.sessionRecording.stop === "function") {
          window.posthog.sessionRecording.stop();
        }
      }
    } catch {
      // no-op: analytics guard should not break login
    }
    return () => {
      try {
        if (typeof window !== "undefined" && window.posthog) {
          if (typeof window.posthog.sessionRecording === "object" && typeof window.posthog.sessionRecording.start === "function") {
            window.posthog.sessionRecording.start();
          }
        }
      } catch {
        // no-op: analytics guard should not break login
      }
    };
  }, []);

  const isValidRedirect = (path) => {
    if (!path) return false;
    try {
      const decoded = decodeURIComponent(path);
      if (decoded.includes("\\") || decoded.includes("\0") || decoded.startsWith("//")) {
        return false;
      }
      return ALLOWED_REDIRECTS.has(decoded);
    } catch {
      return false;
    }
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidMobile = (v) => /^[0-9]{10}$/.test(v);

  const handleSendOtp = async (action = "login") => {
    if (typeof action !== "string") action = "login"; // Prevent React SyntheticEvent from being used as action
    try {
      setBusy(true);
      setInlineError("");
      const trimmed = identifier.trim();
      const payload = isValidMobile(trimmed)
        ? { phone: trimmed, action }
        : { email: trimmed, action };
      const res = await api.post("/auth/send-otp", payload);
      setPhone(res.data?.phone || trimmed);
      setOtpSent(true);
      setResendTimer(60);
      toast.success("OTP sent to your WhatsApp!");
    } catch (err) {
      setInlineError(formatError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = () => {
    const code = (otpCode || "").trim();
    if (!code || code.length !== 6) {
      setInlineError("Enter the 6-digit OTP code.");
      return;
    }
    if (!isValidMobile(phone)) {
      setIdentifierError("Enter a valid 10-digit mobile number.");
      return;
    }

    (async () => {
      try {
        setBusy(true);
        setInlineError("");

        if (authMode === "forgot") {
          if (!password || password.length < 8) {
            setInlineError("Enter a new password with at least 8 characters.");
            return;
          }
          await api.post("/auth/reset-password", { phone, code, new_password: password });
          toast.success("Password reset successfully! You can now log in.");
          setAuthMode("password");
          setOtpSent(false);
          setOtpCode("");
          setPassword("");
          return;
        }

        const user = await otpLogin(phone, code);
        toast.success(`Welcome back, ${user.name}!`);
        const target = searchParams.get("redirect") || "/erp";
        nav(ALLOWED_REDIRECTS.has(target) ? target : "/erp");
      } catch (err) {
        setInlineError(formatError(err));
      } finally {
        setBusy(false);
      }
    })();
  };

  const submit = async (e) => {
    e.preventDefault();
    setInlineError("");
    setIdentifierError("");

    const trimmed = identifier.trim();

    if (!useOtp) {
      if (!trimmed) {
        setInlineError("Enter your email or mobile number.");
        return;
      }
      if (!isValidEmail(trimmed)) {
        setInlineError("Please enter a valid email address.");
        return;
      }
      if (password.length < 8) {
        setInlineError("Password must be at least 8 characters.");
        return;
      }
    } else {
      if (!otpSent) {
        setInlineError("Please send the OTP first.");
        return;
      }
      if (!isValidMobile(phone)) {
        setIdentifierError("Enter a valid 10-digit mobile number.");
        return;
      }
      if (otpCode.length !== 6) {
        setInlineError("Enter the 6-digit OTP code.");
        return;
      }
      setPhone(phone);
      setBusy(true);
      try {
        const user = await otpLogin(phone, otpCode);
        toast.success(`Welcome back, ${user.name}!`);
        const target = searchParams.get("redirect") || "/erp";
        nav(ALLOWED_REDIRECTS.has(target) ? target : "/erp");
      } catch (err) {
        setInlineError(formatError(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    const now = Date.now();
    if (now - lastAttemptRef.current < 2000) {
      setInlineError("Please wait a moment before trying again.");
      return;
    }
    lastAttemptRef.current = now;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setBusy(true);

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setInlineError("Authentication request timed out. Please try again.");
        setBusy(false);
      }
    }, 30000);

    try {
      const u = await login(trimmed.toLowerCase(), password, {
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);
      toast.success("Welcome back!");

      const next = params.get("next");
      if (isValidRedirect(next)) {
        nav(next);
        return;
      }

      if (u.role === "attendance") {
        nav("/erp/erpattendance");
        return;
      }
      if (ERP_ROLES.includes(u.role)) {
        nav("/erp");
        return;
      }
      if (u.role === "school") {
        nav("/school-dashboard");
        return;
      }
      nav(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "CanceledError" || err.name === "AbortError") return;

      if (err.response?.status === 429) {
        setInlineError("Too many login attempts. Please try again later.");
      } else {
        const backendError = typeof formatError === "function"
          ? formatError(err.response?.data?.detail)
          : (err.response?.data?.detail || err.message);

        setInlineError(backendError || "Invalid email or password.");
      }
    } finally {
      setBusy(false);
      setPassword("");
      abortControllerRef.current = null;
    }
  };

  const inputCls = "w-full pl-11 pr-12 py-3.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition shadow-inner";

  return (
    <>
      <Helmet>
        <title>Sign In | Unacademy</title>
        <link rel="canonical" href="https://unacademyedu.com/login" />
      </Helmet>

      <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-12 relative overflow-hidden bg-background" data-testid="login-page">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden flex-col justify-end p-12 lg:p-16">
          <div className="absolute inset-0 z-0">
            {isMobile ? <HeroSceneFallback /> : <HeroScene />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-0 pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-6 text-accent">
              <Sparkle weight="fill" size={12} className="text-accent" />
              Unacademy Kashmir
            </div>
            <Eyebrow>The future of learning</Eyebrow>
            <div className="font-display text-4xl xl:text-6xl font-light tracking-tight leading-[1.08] mt-3">
              Welcome back.<br/><span className="font-medium italic text-accent text-glow-accent">Resume your journey.</span>
            </div>
            <p className="text-muted-foreground mt-4 text-sm font-light leading-relaxed">
              Log in to access your personalized dashboard, track academic performance, study modules, and upcoming tests.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 relative flex items-center justify-center p-6 sm:p-10 lg:p-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md relative"
          >
            <div className="lg:hidden mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-4 text-accent">
                <Sparkle weight="fill" size={12} className="text-accent" />
                Unacademy Kashmir
              </div>
              <h1 className="font-display text-3xl font-light tracking-tight">Welcome back.</h1>
            </div>

            <GlassPanel elevated className="p-8 sm:p-10 shadow-2xl backdrop-blur-xl border-border/80">
              <div className="hidden lg:block mb-8">
                <div className="text-[10px] uppercase tracking-[0.28em] font-bold text-accent mb-2">Secure Authentication</div>
                <h2 className="font-display text-3xl font-medium tracking-tight">Sign in to portal</h2>
              </div>

              <AnimatePresence mode="wait">
                {inlineError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-3 shadow-sm"
                  >
                    <WarningCircle size={18} weight="fill" className="shrink-0 text-destructive mt-0.5" />
                    <span className="leading-relaxed">{inlineError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">Email Address or Mobile Number</label>
                  <div className="relative">
                    <EnvelopeSimple weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input
                      className={inputCls}
                      type="text"
                      placeholder="name@example.com or 10-digit mobile"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value.replace(/[^0-9a-zA-Z@._-]/g, ""))}
                      required
                      autoComplete="username"
                    />
                  </div>
                  {identifierError && <p className="text-xs text-destructive ml-1">{identifierError}</p>}
                </div>

                <AnimatePresence mode="wait">
                  {useOtp ? (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between ml-1 mr-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Enter Verification Code</label>
                        {!otpSent && (
                          <button type="button" onClick={handleSendOtp} className="text-xs text-accent hover:underline font-medium" disabled={busy}>{busy ? "Sending…" : "Send OTP"}</button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                        <OtpInput value={otpCode} onChange={setOtpCode} disabled={!otpSent} />
                      </div>
                      <p className="text-[11px] text-muted-foreground ml-1">We will send a 6-digit OTP via Email or WhatsApp.</p>
                      {otpSent && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={resendTimer > 0 || busy}
                            className={`text-[11px] font-bold uppercase tracking-wider ${resendTimer > 0 ? "text-muted-foreground" : "text-accent hover:underline"}`}
                          >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="password"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between ml-1 mr-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Password</label>
                        <button type="button" onClick={() => { setAuthMode("forgot"); setUseOtp(true); setOtpSent(false); setOtpCode(""); }} className="text-[10px] font-bold text-accent hover:underline">Forgot?</button>
                      </div>
                      <div className="relative">
                        <Lock weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                        <input className={inputCls} type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition" aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeSlash size={18} weight="duotone" /> : <Eye size={18} weight="duotone" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-1 text-right">
                  {!useOtp ? (
                    <button type="button" onClick={() => { setUseOtp(true); setInlineError(""); setIdentifierError(""); setOtpSent(false); setOtpCode(""); }} className="text-xs font-semibold text-accent hover:underline focus:outline-none">Login with OTP instead</button>
                  ) : (
                    <button type="button" onClick={() => { setUseOtp(false); setInlineError(""); setIdentifierError(""); }} className="text-xs font-semibold text-accent hover:underline focus:outline-none">Login with Password instead</button>
                  )}
                </div>

                <div className="pt-2">
                  {!useOtp && authMode !== "forgot" && (
                    <CTAPrimary type="submit" className="w-full justify-center py-4 text-sm font-medium" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</CTAPrimary>
                  )}
                  {useOtp && authMode !== "forgot" && (
                    <CTAPrimary type="submit" className="w-full justify-center py-4 text-sm font-medium" disabled={busy || (otpSent && otpCode.length !== 6)}>{busy ? "Verifying…" : "Sign In"}</CTAPrimary>
                  )}
                  {authMode === "forgot" && (
                    <CTAPrimary type="submit" className="w-full justify-center py-4 text-sm font-medium" disabled={busy || (otpSent && otpCode.length !== 6)}>{busy ? "Resetting…" : "Reset Password"}</CTAPrimary>
                  )}
                </div>
              </form>

              {(otpSent || authMode === "forgot") && authMode !== "password" && (
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyOtp}
                  className="mt-4 space-y-4"
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-bold">Enter OTP</h3>
                    <p className="text-xs text-muted-foreground mt-1">We sent a 6-digit code to {phone || identifier} on WhatsApp.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">6-Digit Code</label>
                    <OtpInput value={otpCode} onChange={setOtpCode} disabled={busy} />
                  </div>
                  {authMode === "forgot" && (
                    <div className="space-y-1.5 mt-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">New Password</label>
                      <input className={inputCls} type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  )}
                  <div className="pt-3 flex gap-2">
                    <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-bold">Change Number</button>
                    <button type="submit" className="flex-1 justify-center py-4 text-sm font-medium" disabled={busy || otpCode.length !== 6}>
                      {busy ? "Verifying…" : authMode === "forgot" ? "Reset Password" : "Verify & Login"}
                    </button>
                  </div>
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleSendOtp(authMode === "forgot" ? "forgot" : "login")}
                      disabled={resendTimer > 0 || busy}
                      className={`text-[11px] font-bold uppercase tracking-wider ${resendTimer > 0 ? "text-muted-foreground" : "text-accent hover:underline"}`}
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </motion.form>
              )}

              <div className="mt-8 pt-6 border-t border-border/60 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-accent font-bold hover:underline inline-flex items-center gap-1 ml-1">
                    Register now
                  </Link>
                </p>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </>
  );
}
