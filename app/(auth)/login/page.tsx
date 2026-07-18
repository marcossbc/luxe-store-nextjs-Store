"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full p-8 rounded-3xl border bg-card shadow-lg">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-lg">L</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to your account</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={18} />} required />
        <Input label="Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} required />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-input" />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg">Sign In</Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">Create one</Link>
      </div>
    </motion.div>
  );
}
