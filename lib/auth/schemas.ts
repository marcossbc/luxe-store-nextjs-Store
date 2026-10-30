import { z } from "zod";

const noControl = (s: string) => !/[\u0000-\u001f\u007f]/.test(s);

export const emailSchema = z.string().trim().toLowerCase().max(254).email("Enter a valid email address.").refine(noControl, "Invalid characters.");

export const nameSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, " "))
  .pipe(z.string().min(2, "Enter your full name.").max(60, "Name is too long.").regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, "Use letters only."));

// A short deny-list of the most common passwords (length is the main control; this blocks the obvious ones).
const COMMON = new Set([
  "password", "password1", "password12", "password123", "12345678", "123456789", "1234567890", "qwerty123", "qwertyuiop",
  "11111111", "00000000", "abc12345", "iloveyou", "admin123", "welcome1", "welcome123", "letmein123", "passw0rd", "p@ssw0rd",
  "dahab123", "dahab1234", "somalia123", "mogadishu1",
]);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Password is too long.")
  .refine(noControl, "Invalid characters.")
  .refine((p) => !COMMON.has(p.toLowerCase()), "That password is too common. Choose something harder to guess.");

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms to continue." }) }),
    remember: z.boolean().optional(),
  })
  .strict()
  .refine((d) => d.password.toLowerCase() !== d.email && !d.email.startsWith(d.password.toLowerCase() + "@"), { path: ["password"], message: "Your password must not be your email." });

export const loginSchema = z
  .object({ email: emailSchema, password: z.string().min(1).max(128), remember: z.boolean().optional() })
  .strict();

/**
 * Only same-site relative paths are accepted for the post-login redirect (open-redirect guard).
 * Anything else (absolute URLs, //host, backslashes, control characters, auth pages) falls back.
 */
export function safeNextPath(next: unknown, fallback = "/profile"): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 200) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\") || !noControl(next)) return fallback;
  try {
    const u = new URL(next, "http://local.invalid");
    if (u.host !== "local.invalid") return fallback;
    if (u.pathname.startsWith("/login") || u.pathname.startsWith("/register") || u.pathname.startsWith("/api/")) return fallback;
    return u.pathname + u.search;
  } catch {
    return fallback;
  }
}

/** Flatten zod issues to { field: firstMessage } for inline form errors (validation messages are safe to show). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
