"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Formats prices with the visitor's locale and the store currency (NEXT_PUBLIC_STORE_CURRENCY).
 * It does NOT convert exchange rates: product prices are assumed to be in the store currency.
 */
export function usePremiumPrice() {
  const [locale, setLocale] = useState("en-US");
  useEffect(() => { setLocale(navigator.language || "en-US"); }, []);
  const currency = process.env.NEXT_PUBLIC_STORE_CURRENCY || "USD";

  return useCallback(
    (n: number) => {
      const opts = { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 };
      try {
        return new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol", ...opts }).format(n);
      } catch {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", ...opts }).format(n);
      }
    },
    [locale, currency]
  );
}
