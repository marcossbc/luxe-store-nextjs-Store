import "server-only";
import type { AuthStore } from "./types";
import { fileStore } from "./file-store";
import { mongoStore } from "./mongo-store";

/** MongoDB when MONGODB_URI is set, otherwise the local JSON file. */
export function getAuthStore(): AuthStore {
  return process.env.MONGODB_URI?.trim() ? mongoStore : fileStore;
}
