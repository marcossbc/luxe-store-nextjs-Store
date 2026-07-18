import type { Product, Category, Review, Brand } from "./types";

export const categories: Category[] = [
  { id: "electronics", name: "Electronics", slug: "electronics", description: "Cutting-edge technology for modern living", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&h=600&fit=crop", productCount: 24, icon: "Zap" },
  { id: "fashion", name: "Fashion", slug: "fashion", description: "Timeless style meets contemporary design", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop", productCount: 36, icon: "Shirt" },
  { id: "home", name: "Home & Living", slug: "home-living", description: "Elevate your everyday spaces", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop", productCount: 18, icon: "Home" },
  { id: "sports", name: "Sports", slug: "sports", description: "Performance gear for active lifestyles", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop", productCount: 15, icon: "Dumbbell" },
  { id: "accessories", name: "Accessories", slug: "accessories", description: "Finishing touches that define you", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop", productCount: 28, icon: "Gem" },
  { id: "beauty", name: "Beauty", slug: "beauty", description: "Premium self-care essentials", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop", productCount: 12, icon: "Sparkles" },
];

export const products: Product[] = [
  {
    id: "prod_001", name: "AirPods Pro Max", slug: "airpods-pro-max",
    description: "Experience audio excellence with the AirPods Pro Max. Featuring Active Noise Cancellation, Transparency mode, and Spatial Audio with dynamic head tracking. The breathable knit mesh canopy and memory foam ear cushions provide exceptional comfort for extended listening sessions.",
    shortDescription: "Premium over-ear headphones with spatial audio",
    price: 549, originalPrice: 599, rating: 4.9, reviewCount: 2847,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop",
    ],
    category: "electronics", categoryName: "Electronics", tags: ["audio", "wireless", "premium"],
    badge: "bestseller", inStock: true, stockCount: 45, sku: "APM-2026-BLK",
    features: ["Active Noise Cancellation", "Spatial Audio with head tracking", "20-hour battery life", "Breathable knit mesh canopy"],
    specifications: { Weight: "384.8g", Connectivity: "Bluetooth 5.3", "Battery Life": "20 hours", Charging: "Lightning / USB-C" },
    createdAt: "2026-01-15",
  },
  {
    id: "prod_002", name: "Minimal Watch Series 9", slug: "minimal-watch-series-9",
    description: "A masterpiece of minimal design. The Series 9 features a sapphire crystal display, titanium case, and advanced health sensors. Water-resistant to 50 meters with a battery that lasts up to 36 hours.",
    shortDescription: "Elegant timepiece with sapphire crystal",
    price: 399, originalPrice: 429, rating: 4.8, reviewCount: 1523,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1434056886845-dbe89f8f5d0e?w=800&h=800&fit=crop",
    ],
    category: "accessories", categoryName: "Accessories", tags: ["watch", "minimal", "premium"],
    badge: "new", inStock: true, stockCount: 32, sku: "MWS-2026-TIT",
    features: ["Sapphire crystal display", "Titanium case", "36-hour battery", "50m water resistance"],
    specifications: { Case: "45mm Titanium", Display: "Sapphire Crystal", "Battery Life": "36 hours", Water: "50 meters" },
    createdAt: "2026-02-01",
  },
  {
    id: "prod_003", name: "Luxe Leather Jacket", slug: "luxe-leather-jacket",
    description: "Handcrafted in Italy from full-grain vegetable-tanned leather. Features premium YKK zippers, quilted viscose lining, and reinforced stitching. Ages beautifully, developing a unique patina over time.",
    shortDescription: "Handcrafted Italian leather with brass hardware",
    price: 899, originalPrice: 1200, rating: 4.7, reviewCount: 892,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=800&fit=crop",
    ],
    category: "fashion", categoryName: "Fashion", tags: ["leather", "jacket", "italian"],
    badge: "sale", inStock: true, stockCount: 18, sku: "LLJ-2026-BRN",
    features: ["Full-grain Italian leather", "Vegetable-tanned finish", "Premium YKK zippers", "Quilted viscose lining"],
    specifications: { Material: "Full-grain leather", Origin: "Italy", Lining: "Viscose quilted", Care: "Professional leather clean" },
    createdAt: "2025-11-20",
  },
  {
    id: "prod_004", name: "Smart Home Hub Pro", slug: "smart-home-hub-pro",
    description: "The central brain of your connected home. Compatible with 5000+ devices, featuring Matter support, Thread border router, and local processing for privacy. Voice control with built-in speakers.",
    shortDescription: "Central control for all smart home devices",
    price: 199, originalPrice: 249, rating: 4.6, reviewCount: 2104,
    images: [
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=800&fit=crop",
    ],
    category: "home", categoryName: "Home & Living", tags: ["smart-home", "automation", "hub"],
    badge: null, inStock: true, stockCount: 67, sku: "SHH-2026-WHT",
    features: ["Matter & Thread support", "5000+ device compatibility", "Local processing", "Built-in speakers"],
    specifications: { Connectivity: "Wi-Fi 6E, Thread, Zigbee", "Voice Assistants": "Alexa, Google, Siri", Processor: "Quad-core ARM", Storage: "32GB eMMC" },
    createdAt: "2026-01-05",
  },
  {
    id: "prod_005", name: "Pro Running Shoes Elite", slug: "pro-running-shoes-elite",
    description: "Engineered for speed. Features a full-length carbon fiber plate, ZoomX responsive foam, and a breathable engineered mesh upper. The waffle outsole provides exceptional traction on any surface.",
    shortDescription: "Carbon fiber plate with responsive foam cushioning",
    price: 189, originalPrice: 220, rating: 4.8, reviewCount: 3421,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
    ],
    category: "sports", categoryName: "Sports", tags: ["running", "shoes", "performance"],
    badge: "trending", inStock: true, stockCount: 89, sku: "PRS-2026-BLK",
    features: ["Full-length carbon plate", "ZoomX responsive foam", "Engineered mesh upper", "Waffle traction outsole"],
    specifications: { Weight: "198g (size 9)", Drop: "8mm", Upper: "Engineered mesh", Midsole: "ZoomX foam" },
    createdAt: "2026-03-10",
  },
  {
    id: "prod_006", name: "Designer Sunglasses", slug: "designer-sunglasses",
    description: "Handmade acetate frames with polarized CR-39 lenses offering 100% UV400 protection. The keyhole bridge and temple tips ensure all-day comfort. Includes premium leather case.",
    shortDescription: "Polarized lenses with UV400 protection",
    price: 329, originalPrice: 380, rating: 4.5, reviewCount: 678,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&h=800&fit=crop",
    ],
    category: "accessories", categoryName: "Accessories", tags: ["sunglasses", "polarized", "designer"],
    badge: null, inStock: true, stockCount: 41, sku: "DSG-2026-TRT",
    features: ["Handmade acetate frames", "Polarized CR-39 lenses", "100% UV400 protection", "Premium leather case"],
    specifications: { Frame: "Acetate", Lenses: "CR-39 polarized", "UV Protection": "UV400", Case: "Genuine leather" },
    createdAt: "2025-12-15",
  },
  {
    id: "prod_007", name: "Wireless Charger Pad", slug: "wireless-charger-pad",
    description: "Premium aluminum wireless charging pad with 15W fast charging. Features temperature control, foreign object detection, and an LED status indicator. Works with all Qi-enabled devices.",
    shortDescription: "Fast wireless charging with aluminum build",
    price: 79, originalPrice: 99, rating: 4.4, reviewCount: 4532,
    images: [
      "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop",
    ],
    category: "electronics", categoryName: "Electronics", tags: ["charger", "wireless", "aluminum"],
    badge: null, inStock: true, stockCount: 156, sku: "WCP-2026-SLV",
    features: ["15W fast charging", "Premium aluminum body", "Temperature control", "Foreign object detection"],
    specifications: { Output: "15W max", Input: "USB-C PD", Material: "CNC aluminum", Compatibility: "All Qi devices" },
    createdAt: "2026-01-20",
  },
  {
    id: "prod_008", name: "Ceramic Vase Set", slug: "ceramic-vase-set",
    description: "Three hand-thrown ceramic vases in a matte finish. Each piece is unique with subtle variations in glaze and form. Perfect for dried flowers, branches, or as standalone sculptural objects.",
    shortDescription: "Hand-thrown ceramic vases in matte finish",
    price: 149, originalPrice: 189, rating: 4.7, reviewCount: 234,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b7e239e5bbae?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1581783342308-f792ca438919?w=800&h=800&fit=crop",
    ],
    category: "home", categoryName: "Home & Living", tags: ["vase", "ceramic", "handmade"],
    badge: "new", inStock: true, stockCount: 23, sku: "CVS-2026-WHT",
    features: ["Hand-thrown ceramic", "Matte finish glaze", "Set of 3 unique pieces", "Food-safe interior"],
    specifications: { Material: "Stoneware ceramic", "Set Includes": "3 vases", Sizes: "Small, Medium, Large", Finish: "Matte glaze" },
    createdAt: "2026-04-01",
  },
  {
    id: "prod_009", name: "Yoga Mat Premium", slug: "yoga-mat-premium",
    description: "Natural rubber yoga mat with alignment guides and 6mm cushioning. The closed-cell surface prevents sweat absorption while the bottom layer provides superior grip on any floor type.",
    shortDescription: "Natural rubber with alignment guides",
    price: 89, originalPrice: 120, rating: 4.6, reviewCount: 1876,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop",
    ],
    category: "sports", categoryName: "Sports", tags: ["yoga", "mat", "natural"],
    badge: null, inStock: true, stockCount: 78, sku: "YMP-2026-GRN",
    features: ["Natural rubber base", "Alignment guides", "6mm cushioning", "Closed-cell surface"],
    specifications: { Material: "Natural rubber", Thickness: "6mm", Dimensions: "183cm x 68cm", Weight: "2.5kg" },
    createdAt: "2025-10-05",
  },
  {
    id: "prod_010", name: "Cashmere Scarf", slug: "cashmere-scarf",
    description: "100% Mongolian cashmere in a classic herringbone weave. Ultra-soft, lightweight, and incredibly warm. Finished with hand-rolled edges for a refined look that elevates any outfit.",
    shortDescription: "100% Mongolian cashmere herringbone weave",
    price: 259, originalPrice: 320, rating: 4.9, reviewCount: 445,
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop",
    ],
    category: "fashion", categoryName: "Fashion", tags: ["cashmere", "scarf", "luxury"],
    badge: "limited", inStock: true, stockCount: 12, sku: "CSF-2026-CRM",
    features: ["100% Mongolian cashmere", "Herringbone weave", "Hand-rolled edges", "Ultra-soft finish"],
    specifications: { Material: "100% Cashmere", Origin: "Mongolia", Dimensions: "180cm x 35cm", Weight: "120g" },
    createdAt: "2025-09-15",
  },
  {
    id: "prod_011", name: "Mechanical Keyboard Pro", slug: "mechanical-keyboard-pro",
    description: "Hot-swappable 75% mechanical keyboard with gasket mount, PBT keycaps, and per-key RGB. Features a CNC aluminum case, sound-dampening foam, and south-facing PCB for optimal switch compatibility.",
    shortDescription: "Hot-swappable with PBT keycaps and RGB",
    price: 249, originalPrice: 299, rating: 4.8, reviewCount: 1234,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
    ],
    category: "electronics", categoryName: "Electronics", tags: ["keyboard", "mechanical", "rgb"],
    badge: null, inStock: true, stockCount: 34, sku: "MKP-2026-BLK",
    features: ["Hot-swappable switches", "PBT double-shot keycaps", "Gasket mount design", "Per-key RGB lighting"],
    specifications: { Layout: "75% (82 keys)", Case: "CNC aluminum", Mount: "Gasket", Connectivity: "USB-C / Bluetooth 5.1" },
    createdAt: "2026-02-20",
  },
  {
    id: "prod_012", name: "Leather Weekender Bag", slug: "leather-weekender-bag",
    description: "Full-grain leather travel bag with solid brass hardware and cotton canvas lining. Features a padded laptop compartment, shoe pocket, and detachable shoulder strap. Ages beautifully with use.",
    shortDescription: "Full-grain leather with brass hardware",
    price: 449, originalPrice: 550, rating: 4.7, reviewCount: 312,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    ],
    category: "accessories", categoryName: "Accessories", tags: ["leather", "bag", "travel"],
    badge: "sale", inStock: true, stockCount: 19, sku: "LWB-2026-BRN",
    features: ["Full-grain leather", "Solid brass hardware", "Padded laptop compartment", "Detachable shoulder strap"],
    specifications: { Material: "Full-grain leather", Lining: "Cotton canvas", Dimensions: "50cm x 28cm x 25cm", Capacity: "35L" },
    createdAt: "2025-08-20",
  },
  {
    id: "prod_013", name: "Smart Fitness Mirror", slug: "smart-fitness-mirror",
    description: "Full-length interactive fitness mirror with AI-powered form correction. Features thousands of on-demand classes, real-time heart rate display, and a sleek design that blends into any room.",
    shortDescription: "AI-powered interactive fitness mirror",
    price: 1499, originalPrice: 1799, rating: 4.8, reviewCount: 567,
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop",
    ],
    category: "sports", categoryName: "Sports", tags: ["fitness", "mirror", "smart"],
    badge: "new", inStock: true, stockCount: 8, sku: "SFM-2026-BLK",
    features: ["AI form correction", "Thousands of classes", "Real-time metrics", "Sleek wall-mounted design"],
    // specifications: { Display: "43" "4K", Camera: "4K wide-angle", Speakers: "30W stereo", Mounting: "Wall or floor stand" },
    specifications: { Display: '43" 4K', Camera: "4K wide-angle", Speakers: "30W stereo", Mounting: "Wall or floor stand" },
    createdAt: "2026-03-15",
  },
  {
    id: "prod_014", name: "Artisan Coffee Maker", slug: "artisan-coffee-maker",
    description: "Precision pour-over coffee maker with PID temperature control, bloom timer, and adjustable flow rate. The gooseneck kettle ensures perfect extraction every time. Includes ceramic dripper and filters.",
    shortDescription: "PID temperature control pour-over system",
    price: 349, originalPrice: 399, rating: 4.9, reviewCount: 823,
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop",
    ],
    category: "home", categoryName: "Home & Living", tags: ["coffee", "pour-over", "artisan"],
    badge: "bestseller", inStock: true, stockCount: 27, sku: "ACM-2026-BLK",
    features: ["PID temperature control", "Bloom timer", "Adjustable flow rate", "Gooseneck precision"],
    specifications: { Capacity: "1.2L", Temperature: "Variable (85-100C)", Power: "1200W", Material: "Stainless steel" },
    createdAt: "2025-12-01",
  },
  {
    id: "prod_015", name: "Silk Sleep Set", slug: "silk-sleep-set",
    description: "22 momme mulberry silk pillowcase and eye mask set. Hypoallergenic, temperature-regulating, and gentle on skin and hair. Includes a silk storage pouch for travel.",
    shortDescription: "22 momme mulberry silk pillowcase set",
    price: 129, originalPrice: 159, rating: 4.7, reviewCount: 1567,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&h=800&fit=crop",
    ],
    category: "beauty", categoryName: "Beauty", tags: ["silk", "sleep", "beauty"],
    badge: "trending", inStock: true, stockCount: 92, sku: "SSS-2026-CRM",
    features: ["22 momme mulberry silk", "Hypoallergenic", "Temperature-regulating", "Includes travel pouch"],
    specifications: { Material: "100% Mulberry silk", Weight: "22 momme", "Set Includes": "Pillowcase + Eye mask", Size: "Standard/Queen" },
    createdAt: "2026-01-25",
  },
];

export const reviews: Review[] = [
  { id: "rev_001", productId: "prod_001", author: "Sarah Chen", avatar: "SC", rating: 5, title: "Absolutely stunning quality", content: "The craftsmanship on these headphones is unlike anything I've experienced. The noise cancellation is world-class and the spatial audio makes movies feel immersive.", date: "2026-06-15", verified: true, helpful: 234 },
  { id: "rev_002", productId: "prod_001", author: "Marcus Webb", avatar: "MW", rating: 5, title: "Worth every penny", content: "I was hesitant about the price, but after using these for a month, I can confidently say they're worth it. The build quality is exceptional.", date: "2026-05-28", verified: true, helpful: 189 },
  { id: "rev_003", productId: "prod_003", author: "Elena Rodriguez", avatar: "ER", rating: 5, title: "Beautiful leather, perfect fit", content: "The leather quality is outstanding. It fits like a glove and the patina is developing beautifully. Already getting compliments.", date: "2026-06-10", verified: true, helpful: 156 },
  { id: "rev_004", productId: "prod_005", author: "James Park", avatar: "JP", rating: 4, title: "Great for daily runs", content: "Lightweight and responsive. The carbon plate really does make a difference in my pace. Sizing runs slightly small.", date: "2026-06-01", verified: true, helpful: 98 },
  { id: "rev_005", productId: "prod_014", author: "Amanda Foster", avatar: "AF", rating: 5, title: "Coffee shop quality at home", content: "The temperature control is incredibly precise. My pour-overs have never tasted better. The build quality is solid and it looks beautiful on my counter.", date: "2026-05-15", verified: true, helpful: 312 },
];

export const brands: Brand[] = [
  { id: "b1", name: "Apple", logo: "/images/brands/apple.svg" },
  { id: "b2", name: "Nike", logo: "/images/brands/nike.svg" },
  { id: "b3", name: "Sony", logo: "/images/brands/sony.svg" },
  { id: "b4", name: "Samsung", logo: "/images/brands/samsung.svg" },
  { id: "b5", name: "Adidas", logo: "/images/brands/adidas.svg" },
  { id: "b6", name: "Bose", logo: "/images/brands/bose.svg" },
  { id: "b7", name: "Dyson", logo: "/images/brands/dyson.svg" },
  { id: "b8", name: "Lululemon", logo: "/images/brands/lululemon.svg" },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  if (categoryId === "all") return products;
  return products.filter((p) => p.category === categoryId);
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return products.filter((p) => p.category === product.category && p.id !== productId).slice(0, limit);
}

export function getProductReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
      p.categoryName.toLowerCase().includes(lowerQuery)
  );
}
