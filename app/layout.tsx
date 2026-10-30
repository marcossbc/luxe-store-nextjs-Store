import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { connection } from "next/server";
import { AuthProvider } from "@/components/auth/auth-provider";
import { getCurrentUser } from "@/lib/auth/session";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CartProvider } from "@/components/layout/cart-provider";
import { WishlistProvider } from "@/components/layout/wishlist-provider";
import { ToastProvider } from "@/components/layout/toast-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  title: `${BRAND.name} | ${BRAND.descriptor}`,
  description: BRAND.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // CSP nonces are generated per request in middleware.ts; pages must render per request to carry them.
  await connection();
  const user = await getCurrentUser(); // who is signed in (from the httpOnly session cookie)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider initialUser={user}>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
