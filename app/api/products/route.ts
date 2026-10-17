import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/providers";

export const revalidate = 300;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || undefined;
  const products = await getAllProducts({ q });
  return NextResponse.json({ products });
}
