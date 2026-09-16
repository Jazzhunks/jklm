import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatError } from "../lib/api";
import { useSessionKeepAlive } from "../hooks/useSessionKeepAlive";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useSessionKeepAlive();

  // ============================================================================
  // REFRESH / SESSION VALIDATION CORE LOGIC
  // ============================================================================
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        const sanitized = typeof err === "object" ? { ...err, request: undefined, response: undefined, config: undefined, stack: err.stack } : err;
        console.error("Session verification fallback triggered:", sanitized);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ============================================================================
  // AUTHENTICATION INTERACTION MUTATORS
  // ============================================================================
  
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

  const login = async (email, password, options = {}) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password }, {
        signal: options.signal // Wire upstream controller cancellation signals
      });
      
      if (data?.access_token) {
        localStorage.setItem("nw_token", data.access_token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
      }
      if (data?.refresh_token) {
        localStorage.setItem("nw_refresh_token", data.refresh_token);
      }
      setUser(data.user);
      return data.user;
    } catch (err) {
      localStorage.removeItem("nw_token");
      localStorage.removeItem("nw_refresh_token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      
      if (data?.access_token) {
        localStorage.setItem("nw_token", data.access_token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
      }
      if (data?.refresh_token) {
        localStorage.setItem("nw_refresh_token", data.refresh_token);
      }
      setUser(data.user);
      return data.user;
    } catch (err) {
      localStorage.removeItem("nw_token");
      localStorage.removeItem("nw_refresh_token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { 
      await api.post("/auth/logout"); 
    } catch (e) { 
      console.warn("Server-side token revocation fallback sequence logs:", e); 
    } finally {
      localStorage.removeItem("nw_token");
      localStorage.removeItem("nw_refresh_token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  return (
    // Provided formatError securely to Context value object mapping
    <AuthCtx.Provider value={{ user, loading, login, otpLogin, register, logout, refresh, formatError }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth hook must be evaluated strictly inside an AuthProvider wrapper element");
  }
  return context;
};