"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, remember }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 429) {
          const mins = Math.max(1, Math.ceil((Number(res.headers.get("Retry-After")) || 60) / 60));
          setError(`Too many failed attempts. Please try again in ${mins} minute${mins > 1 ? "s" : ""}.`);
        } else setError(data?.error?.message ?? "We could not sign you in. Please try again.");
        setPassword("");
        setBusy(false);
        return;
      }
      setUser(data.user);
      router.replace(next);
      router.refresh();
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full p-8 rounded-3xl border bg-card shadow-lg">
      <div className="text-center mb-8">
        <div className="mb-5 flex justify-center text-foreground"><Logo size="lg" stacked tagline /></div>
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to your account</p>
      </div>

      {next !== "/profile" && <p className="mb-4 rounded-xl bg-accent px-4 py-3 text-sm text-muted-foreground">Please sign in to continue.</p>}

      <form className="space-y-4" onSubmit={onSubmit} noValidate={false}>
        {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} placeholder="you@example.com" icon={<Mail size={18} />} required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" maxLength={128} placeholder="••••••••" icon={<Lock size={18} />} required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-input" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <Link href="/contact" className="text-primary hover:underline">Need help signing in?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Signing in..." : "Sign In"}</Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={next !== "/profile" ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="text-primary hover:underline font-medium">Create one</Link>
      </div>
    </motion.div>
  );
}
