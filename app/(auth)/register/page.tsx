"use client";

import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full p-8 rounded-3xl border bg-card shadow-lg">
      <div className="text-center mb-8">
        <div className="mb-5 flex justify-center text-foreground"><Logo size="lg" stacked tagline /></div>
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="mt-2 text-muted-foreground">Join the {BRAND.name} community</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Full Name" type="text" placeholder="John Doe" icon={<User size={18} />} required />
        <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={18} />} required />
        <Input label="Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} required />
        <Input label="Confirm Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} required />
        <div className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 rounded border-input" required />
          <span className="text-muted-foreground">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </span>
        </div>
        <Button type="submit" className="w-full" size="lg">Create Account</Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </div>
    </motion.div>
  );
}
