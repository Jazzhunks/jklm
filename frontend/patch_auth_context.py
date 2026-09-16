import re
with open("src/contexts/AuthContext.jsx", "r") as f:
    content = f.read()

otp_login = """
  const otpLogin = async (phone, code) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { phone, code, action: "login" });
      if (data?.access_token) {
        localStorage.setItem("nw_token", data.access_token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
      }
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };
"""

if "const otpLogin =" not in content:
    content = content.replace("const login = async", otp_login + "\n  const login = async")
    
# also expose otpLogin
content = content.replace("login,\n", "login,\n    otpLogin,\n")

with open("src/contexts/AuthContext.jsx", "w") as f:
    f.write(content)
print("Done patching AuthContext")
