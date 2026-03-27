import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/main.ts", // entry point, nothing to unit test here
        "**/*.d.ts",
      ],
    },
    // run tests in sequence to avoid port conflicts
    pool: "forks",
  },
});
