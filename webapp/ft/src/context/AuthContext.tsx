import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "@/types";
import { loginRequest } from "@/lib/services";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  setUser: (u: AuthUser | null) => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

const STORAGE_KEY = "fasttrack.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        import("@/lib/services").then(s => {
          s.getProfile(u.username).then(p => persist({ ...u, profilePicture: p.profilePicture })).catch(() => {});
        });
      }
    } catch {}
    setLoading(false);
  }, [persist]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await loginRequest(username, password);
    const u: AuthUser = { username, name: res.name, role: res.role };
    persist(u);
    import("@/lib/services").then(s => {
      s.getProfile(username).then(p => persist({ ...u, profilePicture: p.profilePicture })).catch(() => {});
    });
    return u;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({ user, loading, login, logout, setUser: persist }), [user, loading, login, logout, persist]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
