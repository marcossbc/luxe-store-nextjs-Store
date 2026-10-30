import { getCurrentUser } from "@/lib/auth/session";
import { jsonResponse } from "@/lib/security/http";

export async function GET() {
  return jsonResponse({ user: await getCurrentUser() });
}
