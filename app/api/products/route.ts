import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/providers";
import { searchQuerySchema } from "@/lib/security/validate";
import { apiError, requestId } from "@/lib/security/http";
import { logError, logSecurity } from "@/lib/security/logger";

export const revalidate = 300;

export async function GET(req: Request) {
  const rid = requestId(req);
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) {
    logSecurity("validation_failed", { route: "/api/products", requestId: rid });
    return apiError(400, "invalid_query", "Invalid search query.", rid);
  }
  try {
    const products = await getAllProducts({ q: parsed.data.q || undefined });
    return NextResponse.json({ products }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    logError("products_failed", e, { requestId: rid });
    return apiError(500, "internal_error", "Could not load products.", rid);
  }
}
