import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../api/axios";

const AuthContext = createContext(null);
const KEY = "expensio.session";

function getSavedSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (session?.token && session?.user) return session;
  } catch { /* Invalid saved data */ }
  sessionStorage.removeItem(KEY);
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSavedSession);
  const [checking, setChecking] = useState(Boolean(session));
  const user = session?.user || null;
  const token = session?.token || null;

  useEffect(() => {
    setAccessToken(token);
    if (!token) { setChecking(false); return; }
    let active = true;
    api.get("/profile")
      .then(({ data }) => {
        if (!active) return;
        const updated = { token, user: { ...user, ...data.data } };
        sessionStorage.setItem(KEY, JSON.stringify(updated));
        setSession(updated);
      })
      .catch(() => {
        if (!active) return;
        setAccessToken(null);
        sessionStorage.removeItem(KEY);
        setSession(null);
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
    // Validate only on initial mount/token change, not every profile update.
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const next = { token: data.token, user: data.user };
    setAccessToken(next.token);
    sessionStorage.setItem(KEY, JSON.stringify(next));
    setSession(next);
    setChecking(false);
    return next.user;
  };
  const logout = () => {
    sessionStorage.removeItem(KEY);
    setAccessToken(null);
    setSession(null);
    setChecking(false);
  };
  return <AuthContext.Provider value={{ user, token, checking, isAuthenticated: Boolean(user && token), login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
