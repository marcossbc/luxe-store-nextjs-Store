import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CartProvider } from "@/components/layout/cart-provider";
import { WishlistProvider } from "@/components/layout/wishlist-provider";
import { ToastProvider } from "@/components/layout/toast-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Luxe Store | Premium E-Commerce",
  description: "Discover curated products that blend exceptional craftsmanship with modern design.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
