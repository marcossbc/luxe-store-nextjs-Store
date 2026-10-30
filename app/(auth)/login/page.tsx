import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/schemas";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: `Sign in | ${BRAND.name}` };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next); // already signed in
  return <LoginForm next={next} />;
}
