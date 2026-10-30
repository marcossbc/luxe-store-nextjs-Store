"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/auth/types";

interface AuthValue {
  user: PublicUser | null;
  setUser: (u: PublicUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** The server decides who is signed in (root layout reads the session cookie); this just shares it with client components. */
export function AuthProvider({ initialUser, children }: { initialUser: PublicUser | null; children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(initialUser);

  // keep in step with the server after router.refresh() (login/logout in this or another tab)
  useEffect(() => { setUser(initialUser); }, [initialUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(async () => {
    try { await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); } catch { /* cookie is cleared server-side on the next request anyway */ }
    setUser(null);
    router.replace("/");
    router.refresh();
  }, [router]);

  const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
