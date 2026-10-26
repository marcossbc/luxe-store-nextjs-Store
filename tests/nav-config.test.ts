import { afterEach, describe, expect, it } from "vitest";
import { getContactInfo, getSocialLinks, getSupportPhone } from "@/lib/luxe/nav-config";

describe("header contact config (renders nothing unless valid)", () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });

  it("phone: accepts normal formats, rejects junk and script-ish values", () => {
    delete process.env.NEXT_PUBLIC_SUPPORT_PHONE; expect(getSupportPhone()).toBeNull();
    process.env.NEXT_PUBLIC_SUPPORT_PHONE = "+1 (202) 555-0104"; expect(getSupportPhone()).toBe("+1 (202) 555-0104");
    for (const bad of ["call me", "javascript:alert(1)", "12", "+1".repeat(20), "<b>1</b>"]) {
      process.env.NEXT_PUBLIC_SUPPORT_PHONE = bad; expect(getSupportPhone()).toBeNull();
    }
  });

  it("social links: https only, nothing when unset", () => {
    for (const k of ["FACEBOOK", "INSTAGRAM", "X", "YOUTUBE"]) delete process.env[`NEXT_PUBLIC_SOCIAL_${k}`];
    expect(getSocialLinks()).toEqual([]);
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK = "https://facebook.com/luxe";
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM = "javascript:alert(1)";
    process.env.NEXT_PUBLIC_SOCIAL_X = "http://x.com/luxe";
    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE = "https://user:pw@youtube.com/c/luxe";
    expect(getSocialLinks()).toEqual([{ label: "Facebook", href: "https://facebook.com/luxe" }]);
  });
});

describe("contact details (only configured values are shown)", () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });
  it("returns nothing when unset and filters invalid values", () => {
    for (const k of ["EMAIL", "ADDRESS", "HOURS"]) delete process.env[`NEXT_PUBLIC_CONTACT_${k}`];
    delete process.env.NEXT_PUBLIC_SUPPORT_PHONE;
    expect(getContactInfo()).toEqual([]);
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "not-an-email";
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS = "<script>alert(1)</script>";
    expect(getContactInfo()).toEqual([]);
  });
  it("returns valid rows with safe links", () => {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "hello@example.com";
    process.env.NEXT_PUBLIC_SUPPORT_PHONE = "+252 61 234 5678";
    process.env.NEXT_PUBLIC_CONTACT_HOURS = "Sat-Thu 9AM-6PM";
    const rows = getContactInfo();
    expect(rows.map((r) => r.label)).toEqual(["Email", "Phone", "Hours"]);
    expect(rows[0].href).toBe("mailto:hello@example.com");
    expect(rows[1].href).toBe("tel:+252612345678");
  });
});
