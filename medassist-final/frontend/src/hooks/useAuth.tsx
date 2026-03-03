"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age?: string;
  gender?: string;
  blood_group?: string;
  height?: string;
  weight?: string;
  phone?: string;
  emergency?: string;
  occupation?: string;
  conditions?: string[];
  allergies?: string;
  medications?: string;
  sleep?: string;
  lifestyle?: string[];
  setupDone?: boolean;
}

interface AuthCtx {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<UserProfile> & { password: string }) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
  logout: () => void;
  token: string | null;
}

const Ctx = createContext<AuthCtx | null>(null);

const DB_KEY = "medassist_db";
const USER_KEY = "medassist_user";
const TOKEN_KEY = "medassist_token";

function getDB(): Record<string, UserProfile & { password: string }> {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || "{}"); } catch { return {}; }
}
function saveDB(db: object) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (saved && savedToken) {
      setUser(JSON.parse(saved));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const db = getDB();
    const found = db[email.toLowerCase()];
    if (!found) throw new Error("No account found with this email");
    if (found.password !== btoa(password)) throw new Error("Incorrect password");
    const { password: _, ...userData } = found;
    const fakeToken = btoa(`${email}:${Date.now()}`);
    setUser(userData);
    setToken(fakeToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, fakeToken);
  };

  const register = async (data: Partial<UserProfile> & { password: string }) => {
    const db = getDB();
    const key = data.email!.toLowerCase();
    if (db[key]) throw new Error("Email already registered");
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      email: data.email!,
      full_name: data.full_name || "",
      age: data.age,
      gender: data.gender,
      setupDone: false,
      conditions: [],
      lifestyle: [],
    };
    db[key] = { ...newUser, password: btoa(data.password) };
    saveDB(db);
    const fakeToken = btoa(`${data.email}:${Date.now()}`);
    setUser(newUser);
    setToken(fakeToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, fakeToken);
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    const db = getDB();
    if (db[user.email]) db[user.email] = { ...db[user.email], ...data };
    saveDB(db);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, updateUser, logout, token }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
