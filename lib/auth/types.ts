/** Client-safe types (no Node imports). */
export interface PublicUser { id: string; name: string; email: string; createdAt: string }

export interface StoredUser extends PublicUser { passwordHash: string; termsAcceptedAt: string }
export interface StoredSession { tokenHash: string; userId: string; createdAt: string; expiresAt: string }

export type CreateUserResult = { ok: true; user: StoredUser } | { ok: false; reason: "exists" };

/** Storage contract. Two implementations: a local JSON file (default) and MongoDB (when MONGODB_URI is set). */
export interface AuthStore {
  readonly kind: "file" | "mongo";
  findUserByEmail(email: string): Promise<StoredUser | null>;
  findUserById(id: string): Promise<StoredUser | null>;
  createUser(user: StoredUser): Promise<CreateUserResult>;
  saveSession(session: StoredSession): Promise<void>;
  findSession(tokenHash: string): Promise<StoredSession | null>;
  deleteSession(tokenHash: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
}

export const toPublicUser = (u: StoredUser): PublicUser => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });
