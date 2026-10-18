import type { Metadata } from "next";
import Link from "next/link";
import { ShowcaseSection } from "@/components/luxe/showcase-slider";

export const metadata: Metadata = { title: "The Collection | Luxe Store" };

export default function CollectionPage() {
  return (
    <>
      <ShowcaseSection limit={8} />
      <div className="bg-[#0a0a0c] py-10 text-center">
        <Link href="/shop" className="display-title text-2xl tracking-[0.2em] text-white/70 transition-colors hover:text-white">
          View the full shop →
        </Link>
      </div>
    </>
  );
}
