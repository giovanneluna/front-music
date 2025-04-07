import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    isolate: false,
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 10000,
    deps: {
      inline: ["@mui/material", "@mui/icons-material"],
    },
  },
})
