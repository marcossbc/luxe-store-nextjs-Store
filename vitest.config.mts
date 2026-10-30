import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: {
    alias: {
      "@": root,
      // Next.js resolves "server-only" at build time; stub it for unit tests
      "server-only": `${root}tests/stubs/server-only.ts`,
      "next/headers": `${root}tests/stubs/next-headers.ts`,
    },
  },
});
