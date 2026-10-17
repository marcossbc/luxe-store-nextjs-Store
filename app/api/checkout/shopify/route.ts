import { NextResponse } from "next/server";
import { createShopifyCheckout } from "@/lib/providers/shopify";

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items: { variantId?: string; quantity: number; source?: string }[] };
    const lines = items.filter((i) => i.source === "shopify" && i.variantId) as { variantId: string; quantity: number }[];
    if (!lines.length) return NextResponse.json({ error: "No Shopify items" }, { status: 400 });
    const url = await createShopifyCheckout(lines);
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
