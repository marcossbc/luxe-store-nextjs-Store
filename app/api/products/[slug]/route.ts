import { NextResponse } from "next/server";
import { getProduct, getAllProducts } from "@/lib/providers";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const related = (await getAllProducts())
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  return NextResponse.json({ product, related });
}
