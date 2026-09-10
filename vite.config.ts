import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      semicolons: false,
      quoteStyle: "double",
    }),
    react(),
    tailwindcss(),
  ],
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
      provider: playwright(),
    },
    passWithNoTests: true,
    setupFiles: ["./src/test/setup.ts"],
  },
})
