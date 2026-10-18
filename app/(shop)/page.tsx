import { CinematicHero } from "@/components/luxe/cinematic-hero";
import { ShowcaseSection } from "@/components/luxe/showcase-slider";
import { FeaturesBar } from "@/components/sections/features-bar";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { CategoriesSection } from "@/components/sections/categories-section";
import { FlashSale } from "@/components/sections/flash-sale";
import { BestSellers } from "@/components/sections/best-sellers";
import { NewArrivals } from "@/components/sections/new-arrivals";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { BrandPartners } from "@/components/sections/brand-partners";
import { Newsletter } from "@/components/sections/newsletter";

export default function HomePage() {
  return (
    <div className="dark luxe-home space-y-0">
      <CinematicHero targetId="home-showcase" />
      <div id="home-showcase" className="scroll-mt-16 lg:scroll-mt-20">
        <ShowcaseSection limit={5} />
      </div>
      <FeaturesBar />
      <FeaturedProducts />
      <CategoriesSection />
      <FlashSale />
      <BestSellers />
      <NewArrivals />
      <ReviewsSection />
      <BrandPartners />
      <Newsletter />
    </div>
  );
}
