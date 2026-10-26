import { safeHttpsUrl } from "../security/url";

/**
 * Optional storefront contact details, configured through NEXT_PUBLIC_* env vars.
 * Nothing is rendered unless it is configured AND valid, so the header never shows placeholder
 * phone numbers or dead social links. (Literal env names are required: Next.js inlines them at build time.)
 */
export function getSupportPhone(): string | null {
  const v = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  return v && /^\+?[0-9 ()-]{6,20}$/.test(v) ? v : null;
}

export interface SocialLink { label: string; href: string }

export function getSocialLinks(): SocialLink[] {
  const raw: [string, string | undefined][] = [
    ["Facebook", process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK],
    ["Instagram", process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM],
    ["X", process.env.NEXT_PUBLIC_SOCIAL_X],
    ["YouTube", process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE],
  ];
  return raw.flatMap(([label, v]) => {
    const href = safeHttpsUrl(v); // https only: blocks javascript:/data: URLs even if the env is mis-set
    return href ? [{ label, href }] : [];
  });
}

export interface ContactRow { label: "Email" | "Phone" | "Address" | "Hours"; value: string; href?: string }

const clean = (v: string | undefined, max = 160) => {
  const t = v?.trim();
  return t && t.length <= max && !/[\u0000-\u001f\u007f<>]/.test(t) ? t : null;
};

/** Contact details shown on /contact. Only configured, valid values are returned (no invented details). */
export function getContactInfo(): ContactRow[] {
  const rows: ContactRow[] = [];
  const email = clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL, 120);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) rows.push({ label: "Email", value: email, href: `mailto:${email}` });
  const phone = getSupportPhone();
  if (phone) rows.push({ label: "Phone", value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` });
  const address = clean(process.env.NEXT_PUBLIC_CONTACT_ADDRESS);
  if (address) rows.push({ label: "Address", value: address });
  const hours = clean(process.env.NEXT_PUBLIC_CONTACT_HOURS, 80);
  if (hours) rows.push({ label: "Hours", value: hours });
  return rows;
}
