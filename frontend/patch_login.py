import re
with open("src/pages/Login.jsx", "r") as f:
    content = f.read()

# Add states for OTP
state_add = """  const [authMode, setAuthMode] = useState("password"); // "password", "otp", "forgot"
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const { otpLogin } = useAuth();
"""
content = content.replace('  const [inlineError, setInlineError] = useState("");', '  const [inlineError, setInlineError] = useState("");\n' + state_add)

# Update submit logic
new_submit = """
  const handleSendOtp = async (action) => {
    try {
      setBusy(true);
      setInlineError("");
      await api.post("/auth/send-otp", { phone, action });
      setOtpSent(true);
      toast.success("OTP sent to your WhatsApp!");
    } catch (err) {
      setInlineError(err.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      setInlineError("");
      
      if (authMode === "forgot") {
        await api.post("/auth/reset-password", { phone, code: otpCode, new_password: password });
        toast.success("Password reset successfully! You can now log in.");
        setAuthMode("password");
        setOtpSent(false);
        setOtpCode("");
      } else {
        const user = await otpLogin(phone, otpCode);
        toast.success(`Welcome back, ${user.name}!`);
        const target = searchParams.get("redirect") || "/erp";
        nav(ALLOWED_REDIRECTS.has(target) ? target : "/erp");
      }
    } catch (err) {
      setInlineError(err.response?.data?.detail || "Invalid or expired OTP.");
    } finally {
      setBusy(false);
    }
  };
"""
content = content.replace("const submit = async (e) => {", new_submit + "\n  const submit = async (e) => {")

# Update UI Forms
old_form = """              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">Email Address</label>
                  <div className="relative">
                    <EnvelopeSimple weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input 
                      className={inputCls} 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      maxLength={254}
                      autoComplete="email"
                      data-testid="email-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1 mr-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Password</label>
                  </div>
                  <div className="relative">
                    <Lock weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input 
                      className={inputCls} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      maxLength={128}
                      autoComplete="current-password"
                      data-testid="password-input"
                    />
                    
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeSlash size={18} weight="duotone" /> : <Eye size={18} weight="duotone" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <CTAPrimary type="submit" className="w-full justify-center py-4 text-sm font-medium tracking-wide shadow-lg shadow-accent/20" data-testid="login-submit" disabled={busy}>
                    {busy ? "Signing in…" : "Sign In to Portal"}
                  </CTAPrimary>
                </div>
              </form>"""

new_form = """
              {/* Auth Mode Toggle */}
              {!otpSent && (
                <div className="flex bg-muted/50 p-1 rounded-xl mb-6">
                  <button type="button" onClick={() => { setAuthMode("password"); setInlineError(""); }} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${authMode === "password" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Password</button>
                  <button type="button" onClick={() => { setAuthMode("otp"); setInlineError(""); }} className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${authMode === "otp" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>WhatsApp OTP</button>
                </div>
              )}

              {authMode === "password" && !otpSent && (
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">Email Address</label>
                    <div className="relative">
                      <EnvelopeSimple weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                      <input className={inputCls} type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1 mr-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Password</label>
                      <button type="button" onClick={() => setAuthMode("forgot")} className="text-[10px] font-bold text-accent hover:underline">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock weight="duotone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                      <input className={inputCls} type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <div className="pt-3">
                    <CTAPrimary type="submit" className="w-full justify-center py-4 text-sm font-medium" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</CTAPrimary>
                  </div>
                </form>
              )}

              {(authMode === "otp" || authMode === "forgot") && !otpSent && (
                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(authMode === "forgot" ? "forgot" : "login"); }} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold">{authMode === "forgot" ? "Reset Password" : "Login with WhatsApp"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Enter your registered mobile number to receive a 6-digit OTP via WhatsApp.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">Mobile Number</label>
                    <input className={inputCls} type="text" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} required maxLength={15} />
                  </div>
                  <div className="pt-3 flex gap-2">
                    {authMode === "forgot" && <button type="button" onClick={() => setAuthMode("password")} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-bold">Back</button>}
                    <CTAPrimary type="submit" className="flex-1 justify-center py-4 text-sm font-medium" disabled={busy}>{busy ? "Sending…" : "Get OTP"}</CTAPrimary>
                  </div>
                </form>
              )}

              {otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold">Enter OTP</h3>
                    <p className="text-xs text-muted-foreground mt-1">We sent a 6-digit code to {phone} on WhatsApp.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">6-Digit Code</label>
                    <input className={`${inputCls} font-mono tracking-widest text-center text-lg`} type="text" placeholder="------" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} />
                  </div>
                  {authMode === "forgot" && (
                    <div className="space-y-1.5 mt-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">New Password</label>
                      <input className={inputCls} type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  )}
                  <div className="pt-3 flex gap-2">
                    <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-bold">Change Number</button>
                    <CTAPrimary type="submit" className="flex-1 justify-center py-4 text-sm font-medium" disabled={busy || otpCode.length !== 6}>
                      {busy ? "Verifying…" : authMode === "forgot" ? "Reset Password" : "Verify & Login"}
                    </CTAPrimary>
                  </div>
                </form>
              )}
"""
content = content.replace(old_form, new_form)

with open("src/pages/Login.jsx", "w") as f:
    f.write(content)
print("Done patching Login.jsx")
