import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      // Next.js resolves "server-only" at build time; stub it for unit tests
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
