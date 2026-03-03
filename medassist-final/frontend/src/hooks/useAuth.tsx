"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
}

interface AuthCtx {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; full_name: string; password: string }) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("medassist_token");
    const savedUser  = localStorage.getItem("medassist_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid email or password");
    }
    const data        = await res.json();
    const accessToken = data.access_token;
    const meRes       = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = await meRes.json();
    setToken(accessToken);
    setUser(me);
    localStorage.setItem("medassist_token", accessToken);
    localStorage.setItem("medassist_user", JSON.stringify(me));
  };

  const register = async (data: { email: string; full_name: string; password: string }) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    await login(data.email, data.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("medassist_token");
    localStorage.removeItem("medassist_user");
    window.location.href = "/login";
  };

  return (
    <Ctx.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}