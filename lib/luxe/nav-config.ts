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
