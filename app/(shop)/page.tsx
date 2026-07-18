import { HeroSection } from "@/components/sections/hero-section";
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
    <div className="space-y-0">
      <HeroSection />
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
