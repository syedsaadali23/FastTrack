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

  // Silently patch just the profilePicture without triggering a full re-render
  // via a new persist() call — only updates state if picture actually changed
  const patchProfilePicture = useCallback((username: string, picture: string | null | undefined) => {
    setUser(prev => {
      if (!prev || prev.username !== username) return prev;
      if (prev.profilePicture === picture) return prev; // no change, no re-render
      const updated: AuthUser = { ...prev, profilePicture: picture === null ? undefined : picture };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        import("@/lib/services").then(s => {
          s.getProfile(u.username)
            .then(p => patchProfilePicture(u.username, p.profilePicture))
            .catch(() => {});
        });
      }
    } catch {}
    setLoading(false);
  }, [patchProfilePicture]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await loginRequest(username, password);
    const u: AuthUser = { username, name: res.name, role: res.role };
    persist(u);
    import("@/lib/services").then(s => {
      s.getProfile(username)
        .then(p => patchProfilePicture(username, p.profilePicture))
        .catch(() => {});
    });
    return u;
  }, [persist, patchProfilePicture]);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({ user, loading, login, logout, setUser: persist }), [user, loading, login, logout, persist]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}