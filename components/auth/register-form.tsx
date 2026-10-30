"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { passwordStrength } from "@/lib/auth/strength";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const BAR = ["bg-muted", "bg-rose-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const strength = passwordStrength(f.password);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: k === "terms" ? e.target.checked : e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const local: Record<string, string> = {};
    if (f.name.trim().length < 2) local.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) local.email = "Enter a valid email address.";
    if (f.password.length < 8) local.password = "Use at least 8 characters.";
    if (f.password !== f.confirm) local.confirm = "Passwords do not match.";
    if (!f.terms) local.terms = "You must accept the terms to continue.";
    setErrors(local);
    setError("");
    if (Object.keys(local).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, email: f.email, password: f.password, acceptTerms: f.terms, remember: true }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.error?.fields) setErrors(data.error.fields);
        if (res.status === 429) setError(data?.error?.message ?? "Too many attempts. Please try again later.");
        else if (!data?.error?.fields) setError(data?.error?.message ?? "We could not create your account. Please try again.");
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
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="mt-2 text-muted-foreground">Join the {BRAND.name} community</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        <Input label="Full Name" name="name" type="text" autoComplete="name" maxLength={60} placeholder="Your full name" icon={<User size={18} />} required value={f.name} onChange={set("name")} error={errors.name} />
        <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} placeholder="you@example.com" icon={<Mail size={18} />} required value={f.email} onChange={set("email")} error={errors.email} />
        <div>
          <Input label="Password" name="password" type="password" autoComplete="new-password" maxLength={128} placeholder="At least 8 characters" icon={<Lock size={18} />} required value={f.password} onChange={set("password")} error={errors.password} />
          {f.password && (
            <div className="mt-2" aria-live="polite">
              <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= strength.score ? BAR[strength.score] : "bg-muted")} />)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Strength: {strength.label}</p>
            </div>
          )}
        </div>
        <Input label="Confirm Password" name="confirm" type="password" autoComplete="new-password" maxLength={128} placeholder="Repeat your password" icon={<Lock size={18} />} required value={f.confirm} onChange={set("confirm")} error={errors.confirm} />
        <div>
          <div className="flex items-start gap-2 text-sm">
            <input id="terms" type="checkbox" className="mt-1 rounded border-input" checked={f.terms} onChange={set("terms")} required />
            <label htmlFor="terms" className="text-muted-foreground cursor-pointer">
              I agree to the <span className="font-medium text-foreground">Terms of Service</span> and <span className="font-medium text-foreground">Privacy Policy</span>
            </label>
          </div>
          {errors.terms && <p role="alert" className="mt-1 text-xs text-destructive">{errors.terms}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Creating your account..." : "Create Account"}</Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={next !== "/profile" ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-primary hover:underline font-medium">Sign in</Link>
      </div>
    </motion.div>
  );
}
