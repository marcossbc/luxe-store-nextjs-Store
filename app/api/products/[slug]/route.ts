import { NextResponse } from "next/server";
import { getProduct, getAllProducts } from "@/lib/providers";
import { slugSchema } from "@/lib/security/validate";
import { apiError, requestId } from "@/lib/security/http";
import { logError, logSecurity } from "@/lib/security/logger";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rid = requestId(req);
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) {
    logSecurity("validation_failed", { route: "/api/products/[slug]", requestId: rid });
    return apiError(400, "invalid_slug", "Invalid product identifier.", rid);
  }
  try {
    const product = await getProduct(slug);
    if (!product) return apiError(404, "not_found", "Product not found.", rid);
    const related = (await getAllProducts()).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
    return NextResponse.json({ product, related }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    logError("product_failed", e, { requestId: rid, slug });
    return apiError(500, "internal_error", "Could not load the product.", rid);
  }
}
