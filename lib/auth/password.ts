import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * scrypt (memory-hard) from Node's standard library: no native dependency to compile on Windows.
 * N=2^15, r=8, p=3 is one of the OWASP-recommended equivalent configurations (~32 MiB per hash).
 * The parameters are stored with every hash, so they can be raised later without breaking old passwords.
 */
const N = 32768, R = 8, P = 3, KEYLEN = 64;
const MAXMEM = 128 * 1024 * 1024;

const scrypt = (pw: string, salt: Buffer, keylen: number, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCb(pw, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))));

const norm = (pw: string) => pw.normalize("NFKC");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(norm(password), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/** Constant-time verification. Malformed or tampered hashes simply fail. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  // refuse absurd parameters from a corrupted record (would otherwise let bad data exhaust memory/CPU)
  const pow2 = Number.isInteger(n) && n >= 1024 && n <= 2 ** 20 && (n & (n - 1)) === 0;
  if (!pow2 || !Number.isInteger(r) || r < 1 || r > 16 || !Number.isInteger(p) || p < 1 || p > 16) return false;
  try {
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (salt.length < 8 || expected.length < 16 || expected.length > 128) return false;
    const actual = await scrypt(norm(password), salt, expected.length, { N: n, r, p, maxmem: MAXMEM });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

let dummy: Promise<string> | undefined;
/** Burn the same time as a real check when the email is unknown, so response time does not reveal which emails exist. */
export async function dummyVerify(password: string): Promise<void> {
  dummy ??= hashPassword("dahab-dummy-password-for-timing");
  await verifyPassword(password, await dummy);
}
