import type { AuthStore, CreateUserResult, StoredSession, StoredUser } from "./types";

/**
 * MongoDB store (official driver, already a dependency). Activated when MONGODB_URI is set.
 * Indexes: unique users.email, unique sessions.tokenHash, and a TTL index that deletes expired sessions.
 * NOTE: this adapter could not be exercised against a real MongoDB in the build sandbox; test it with your own database.
 */
type G = { __dahabMongo?: Promise<{ users: any; sessions: any }> };
const g = globalThis as unknown as G;

function connect() {
  g.__dahabMongo ??= (async () => {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI as string, { serverSelectionTimeoutMS: 8000, appName: "dahab-store" });
    await client.connect();
    const db = client.db(process.env.MONGODB_DB?.trim() || "dahab");
    const users = db.collection("users");
    const sessions = db.collection("sessions");
    await Promise.all([
      users.createIndex({ email: 1 }, { unique: true }),
      users.createIndex({ id: 1 }, { unique: true }),
      sessions.createIndex({ tokenHash: 1 }, { unique: true }),
      sessions.createIndex({ userId: 1 }),
      sessions.createIndex({ expiresAtDate: 1 }, { expireAfterSeconds: 0 }),
    ]);
    return { users, sessions };
  })();
  return g.__dahabMongo;
}

const strip = <T extends { _id?: unknown }>(d: T | null): Omit<T, "_id"> | null => {
  if (!d) return null;
  const { _id, ...rest } = d;
  void _id;
  return rest;
};

export const mongoStore: AuthStore = {
  kind: "mongo",
  async findUserByEmail(email) { const { users } = await connect(); return strip(await users.findOne({ email })) as StoredUser | null; },
  async findUserById(id) { const { users } = await connect(); return strip(await users.findOne({ id })) as StoredUser | null; },
  async createUser(user): Promise<CreateUserResult> {
    const { users } = await connect();
    try {
      await users.insertOne({ ...user });
      return { ok: true, user };
    } catch (e) {
      if ((e as { code?: number }).code === 11000) return { ok: false, reason: "exists" };
      throw e;
    }
  },
  async saveSession(s: StoredSession) {
    const { sessions } = await connect();
    await sessions.insertOne({ ...s, expiresAtDate: new Date(s.expiresAt) });
    const mine = await sessions.find({ userId: s.userId }).sort({ createdAt: -1 }).skip(10).project({ tokenHash: 1 }).toArray();
    if (mine.length) await sessions.deleteMany({ tokenHash: { $in: mine.map((m: { tokenHash: string }) => m.tokenHash) } });
  },
  async findSession(tokenHash) {
    const { sessions } = await connect();
    const s = strip(await sessions.findOne({ tokenHash })) as (StoredSession & { expiresAtDate?: Date }) | null;
    if (!s || Date.parse(s.expiresAt) <= Date.now()) return null;
    const { expiresAtDate, ...rest } = s;
    void expiresAtDate;
    return rest;
  },
  async deleteSession(tokenHash) { const { sessions } = await connect(); await sessions.deleteOne({ tokenHash }); },
  async deleteUserSessions(userId) { const { sessions } = await connect(); await sessions.deleteMany({ userId }); },
};
