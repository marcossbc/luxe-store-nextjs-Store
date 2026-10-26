import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { CinematicHero } from "@/components/luxe/cinematic-hero";
import { ShowcaseSection } from "@/components/luxe/showcase-slider";

export const metadata: Metadata = { title: `The Collection | ${BRAND.name}` };

export default function CollectionPage() {
  return (
    <>
      <CinematicHero targetId="collection-slider" />
      <div id="collection-slider" className="scroll-mt-16 lg:scroll-mt-20">
        <ShowcaseSection limit={8} />
      </div>
      <div className="bg-[#0a0a0c] py-10 text-center">
        <Link href="/shop" className="display-title text-2xl tracking-[0.2em] text-white/70 transition-colors hover:text-white">
          View the full shop →
        </Link>
      </div>
    </>
  );
}
