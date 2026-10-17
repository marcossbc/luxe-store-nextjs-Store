export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  categoryName: string;
  tags: string[];
  badge?: "bestseller" | "new" | "sale" | "limited" | "trending";
  inStock: boolean;
  stockCount: number;
  sku: string;
  features: string[];
  specifications: Record<string, string>;
  createdAt: string;
  source?: "static" | "shopify" | "cj";
  externalId?: string;
  variantId?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: string;
  color?: string;
  size?: string;
  sku?: string;
  price?: number;
  image?: string;
  inStock: boolean;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  icon: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  quantity: number;
  maxQuantity: number;
  source?: "static" | "shopify" | "cj";
  variantId?: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
}
