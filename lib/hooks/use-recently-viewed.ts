"use client";

import { parseRecent } from "@/lib/security/storage";

const KEY = "luxe-recent";

export function rememberProduct(slug: string) {
  try {
    const list = parseRecent(localStorage.getItem(KEY));
    localStorage.setItem(KEY, JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 12)));
  } catch { /* storage unavailable */ }
}

export function readRecent(): string[] {
  try { return parseRecent(localStorage.getItem(KEY)); } catch { return []; }
}
