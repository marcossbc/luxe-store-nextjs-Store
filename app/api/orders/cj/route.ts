import { NextResponse } from "next/server";
import { createCjOrder, type CjOrderInput } from "@/lib/providers/cj";

/**
 * Call this ONLY after payment is confirmed (e.g. from a Stripe/PayPal webhook).
 * Protect with a shared secret so nobody can create CJ orders by hitting the URL.
 */
export async function POST(req: Request) {
  if (req.headers.get("x-order-secret") !== process.env.ORDER_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const order = (await req.json()) as CjOrderInput;
    const result = await createCjOrder(order);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
