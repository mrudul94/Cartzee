import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vitest/config";

const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const ROOTS = [dir("./shared/src/"), dir("./admin/src/"), dir("./shop/src/")];
const EXT = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

/**
 * Mirrors each app's tsconfig `@/*` → [app src, shared src] lookup for tests:
 * "@/x" resolves to shared/src/x, else admin/src/x, else shop/src/x.
 * Tests import app routes explicitly via @shop/* and @admin/*.
 */
function atAlias(): Plugin {
  return {
    name: "cityseller-at-alias",
    enforce: "pre",
    resolveId(id) {
      if (!id.startsWith("@/")) return null;
      const rest = id.slice(2);
      for (const root of ROOTS) for (const ext of EXT) if (existsSync(root + rest + ext) && (ext || !existsSync(root + rest + "/"))) return root + rest + ext;
      return null;
    },
  };
}

export default defineConfig({
  plugins: [atAlias()],
  resolve: {
    alias: {
      "@shop": dir("./shop/src"),
      "@admin": dir("./admin/src"),
      // `server-only` throws outside React Server Components; tests run server code directly.
      "server-only": dir("./tests/stubs/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
  },
});
