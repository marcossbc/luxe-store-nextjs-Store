import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { dummyVerify, hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, registerSchema, safeNextPath } from "@/lib/auth/schemas";
import { __resetLockout, checkLock, clearFailures, MAX_FAILS, recordFailure } from "@/lib/auth/lockout";
import { fileStore } from "@/lib/auth/file-store";
import { hashToken } from "@/lib/auth/session";
import type { StoredUser } from "@/lib/auth/types";

describe("password hashing (scrypt)", () => {
  it("verifies the right password and rejects wrong ones", async () => {
    const h = await hashPassword("Correct Horse 9!");
    expect(h.startsWith("scrypt$32768$8$3$")).toBe(true);
    expect(await verifyPassword("Correct Horse 9!", h)).toBe(true);
    expect(await verifyPassword("correct horse 9!", h)).toBe(false);
    expect(await verifyPassword("", h)).toBe(false);
  });
  it("uses a different salt every time (same password, different hash)", async () => {
    const [a, b] = await Promise.all([hashPassword("same-password-1"), hashPassword("same-password-1")]);
    expect(a).not.toBe(b);
  });
  it("treats unicode-equivalent passwords as equal (NFKC) but never stores plaintext", async () => {
    const h = await hashPassword("ｐａｓｓｗｏｒｄ-Ａ1");
    expect(h).not.toContain("password");
    expect(await verifyPassword("password-A1", h)).toBe(true);
  });
  it("fails closed on malformed or dangerous stored hashes", async () => {
    for (const bad of ["", "plain", "scrypt$1$1$1$a$b", "scrypt$99999999$8$3$AAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAA", "bcrypt$x$y$z$a$b", "scrypt$32768$8$3$$"]) {
      expect(await verifyPassword("x", bad)).toBe(false);
    }
  });
  it("dummyVerify completes without throwing (used to equalise timing for unknown emails)", async () => {
    await expect(dummyVerify("anything")).resolves.toBeUndefined();
  });
});

describe("validation", () => {
  const ok = { name: "Hodan  Ali", email: "  Hodan@Example.COM ", password: "Sunrise-Garoowe-7", acceptTerms: true as const };
  it("normalises name and email", () => {
    const r = registerSchema.parse(ok);
    expect(r.email).toBe("hodan@example.com");
    expect(r.name).toBe("Hodan Ali");
  });
  it("accepts international names", () => {
    for (const name of ["Cabdiraxmaan Maxamed", "José Núñez", "Zoë O'Neil-Smith", "李小龍"]) expect(registerSchema.safeParse({ ...ok, name }).success).toBe(true);
  });
  it("rejects bad names, emails, short/common passwords, missing terms, unknown fields", () => {
    const bad = [
      { ...ok, name: "A" }, { ...ok, name: "<script>alert(1)</script>" }, { ...ok, name: "x".repeat(61) },
      { ...ok, email: "nope" }, { ...ok, email: "a@b" },
      { ...ok, password: "short" }, { ...ok, password: "password123" }, { ...ok, password: "x".repeat(129) },
      { ...ok, password: "hodan@example.com" },
      { ...ok, acceptTerms: false }, { ...ok, role: "admin" },
    ];
    for (const b of bad) expect(registerSchema.safeParse(b).success).toBe(false);
  });
  it("login schema is strict and bounded", () => {
    expect(loginSchema.safeParse({ email: "A@b.co", password: "x" }).success).toBe(true);
    for (const b of [{ email: "a@b.co" }, { email: "a@b.co", password: "x".repeat(129) }, { email: "a@b.co", password: "x", admin: true }]) expect(loginSchema.safeParse(b).success).toBe(false);
  });
  it("safeNextPath only allows same-site relative paths (open-redirect guard)", () => {
    expect(safeNextPath("/checkout")).toBe("/checkout");
    expect(safeNextPath("/shop?category=home&q=a")).toBe("/shop?category=home&q=a");
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "evil", "", undefined, null, 5, "/login", "/register?x=1", "/api/auth/logout", "/a\nb", "/" + "x".repeat(300)]) {
      expect(safeNextPath(bad)).toBe("/profile");
    }
    expect(safeNextPath("https://evil.com", "/")).toBe("/");
  });
});

describe("brute-force lockout", () => {
  beforeEach(() => __resetLockout());
  it("locks after MAX_FAILS and unlocks on success/clear", () => {
    for (let i = 0; i < MAX_FAILS - 1; i++) { recordFailure("a|1", 1000); expect(checkLock("a|1", 1000).locked).toBe(false); }
    recordFailure("a|1", 1000);
    const l = checkLock("a|1", 2000);
    expect(l.locked).toBe(true);
    expect(l.retryAfter).toBeGreaterThan(800);
    expect(checkLock("b|1", 2000).locked).toBe(false); // other email/IP pairs are unaffected
    expect(checkLock("a|1", 1000 + 16 * 60_000).locked).toBe(false); // expires
    clearFailures("a|1"); expect(checkLock("a|1", 2000).locked).toBe(false);
  });
});

describe("file store", () => {
  let dir = "";
  const user = (n: number, email = `u${n}@example.com`): StoredUser => ({ id: `id${n}`, name: `User ${n}`, email, passwordHash: "h", createdAt: new Date().toISOString(), termsAcceptedAt: new Date().toISOString() });
  beforeAll(() => { dir = mkdtempSync(path.join(tmpdir(), "dahab-auth-")); process.env.AUTH_DATA_DIR = dir; });
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); delete process.env.AUTH_DATA_DIR; });

  it("creates and finds users; email is unique", async () => {
    expect((await fileStore.createUser(user(1))).ok).toBe(true);
    expect((await fileStore.createUser(user(2, "u1@example.com"))).ok).toBe(false);
    expect((await fileStore.findUserByEmail("u1@example.com"))?.id).toBe("id1");
    expect((await fileStore.findUserById("id1"))?.email).toBe("u1@example.com");
    expect(await fileStore.findUserByEmail("none@example.com")).toBeNull();
  });
  it("concurrent registrations of one email: exactly one wins", async () => {
    const results = await Promise.all(Array.from({ length: 12 }, (_, i) => fileStore.createUser(user(100 + i, "race@example.com"))));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });
  it("stores the data file with owner-only permissions (POSIX)", () => {
    if (process.platform === "win32") return;
    expect(statSync(path.join(dir, "auth.json")).mode & 0o777).toBe(0o600);
  });
  it("sessions: save, find, expire, delete, per-user cleanup", async () => {
    const t = Date.now();
    const mk = (hash: string, userId: string, ms: number) => ({ tokenHash: hash, userId, createdAt: new Date(t).toISOString(), expiresAt: new Date(t + ms).toISOString() });
    await fileStore.saveSession(mk("live", "id1", 60_000));
    await fileStore.saveSession(mk("dead", "id1", -1000));
    expect((await fileStore.findSession("live"))?.userId).toBe("id1");
    expect(await fileStore.findSession("dead")).toBeNull();
    await fileStore.deleteSession("live");
    expect(await fileStore.findSession("live")).toBeNull();
    await fileStore.saveSession(mk("a", "id1", 60_000)); await fileStore.saveSession(mk("b", "id1", 60_000));
    await fileStore.deleteUserSessions("id1");
    expect(await fileStore.findSession("a")).toBeNull();
    expect(await fileStore.findSession("b")).toBeNull();
  });
  it("keeps at most 10 live sessions per user", async () => {
    const t = Date.now();
    for (let i = 0; i < 13; i++) await fileStore.saveSession({ tokenHash: `s${i}`, userId: "id9", createdAt: new Date(t + i).toISOString(), expiresAt: new Date(t + 60_000).toISOString() });
    expect(await fileStore.findSession("s0")).toBeNull();
    expect(await fileStore.findSession("s12")).not.toBeNull();
  });
});

describe("session tokens", () => {
  it("hashes deterministically and never equals the token", () => {
    const h = hashToken("abc");
    expect(h).toBe(hashToken("abc"));
    expect(h).not.toContain("abc");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
