import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/schemas";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: `Create account | ${BRAND.name}` };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return <RegisterForm next={next} />;
}
