import { promises as fs } from "node:fs";
import path from "node:path";
import type { AuthStore, CreateUserResult, StoredSession, StoredUser } from "./types";

/**
 * Local JSON-file store: zero setup, good for development and a single server with a writable disk.
 * (Serverless hosts such as Vercel have a read-only disk: set MONGODB_URI there instead.)
 * Writes are serialised and atomic (temp file + rename), and the file is created with owner-only permissions.
 */
interface DB { users: StoredUser[]; sessions: StoredSession[] }

const g = globalThis as unknown as { __dahabAuthQueue?: Promise<unknown> };
const dir = () => process.env.AUTH_DATA_DIR?.trim() || path.join(process.cwd(), ".data");
const file = () => path.join(dir(), "auth.json");

// one queue per process (module copies in Next dev would otherwise each get their own and race)
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = (g.__dahabAuthQueue ?? Promise.resolve()).then(fn, fn);
  g.__dahabAuthQueue = run.then(() => undefined, () => undefined);
  return run;
}

async function read(): Promise<DB> {
  try {
    const j = JSON.parse(await fs.readFile(file(), "utf8"));
    return { users: Array.isArray(j.users) ? j.users : [], sessions: Array.isArray(j.sessions) ? j.sessions : [] };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { users: [], sessions: [] };
    throw e;
  }
}

async function write(db: DB): Promise<void> {
  const now = Date.now();
  db.sessions = db.sessions.filter((s) => Date.parse(s.expiresAt) > now); // drop expired sessions on every write
  await fs.mkdir(dir(), { recursive: true, mode: 0o700 });
  const tmp = `${file()}.${process.pid}.${now}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db), { mode: 0o600 });
  await fs.rename(tmp, file());
}

export const fileStore: AuthStore = {
  kind: "file",
  findUserByEmail: (email) => locked(async () => (await read()).users.find((u) => u.email === email) ?? null),
  findUserById: (id) => locked(async () => (await read()).users.find((u) => u.id === id) ?? null),
  createUser: (user) =>
    locked(async (): Promise<CreateUserResult> => {
      const db = await read();
      if (db.users.some((u) => u.email === user.email)) return { ok: false, reason: "exists" };
      db.users.push(user);
      await write(db);
      return { ok: true, user };
    }),
  saveSession: (session) =>
    locked(async () => {
      const db = await read();
      db.sessions.push(session);
      // at most 10 live sessions per user: the oldest are dropped
      const mine = db.sessions.filter((s) => s.userId === session.userId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const old of mine.slice(0, Math.max(0, mine.length - 10))) db.sessions = db.sessions.filter((s) => s.tokenHash !== old.tokenHash);
      await write(db);
    }),
  findSession: (tokenHash) =>
    locked(async () => {
      const s = (await read()).sessions.find((x) => x.tokenHash === tokenHash);
      return s && Date.parse(s.expiresAt) > Date.now() ? s : null;
    }),
  deleteSession: (tokenHash) =>
    locked(async () => {
      const db = await read();
      db.sessions = db.sessions.filter((s) => s.tokenHash !== tokenHash);
      await write(db);
    }),
  deleteUserSessions: (userId) =>
    locked(async () => {
      const db = await read();
      db.sessions = db.sessions.filter((s) => s.userId !== userId);
      await write(db);
    }),
};
