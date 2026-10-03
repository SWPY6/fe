import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  define: {
    FEEDBACK_BUILD_VERSION: JSON.stringify(process.env.BUILD_VERSION ?? `local-${Date.now()}`),
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routeFileIgnorePattern: "(^|/)page\\.tsx$",
      semicolons: false,
      quoteStyle: "double",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  // 특정 개발·테스트 오류를 우회하려고 optimizeDeps.include에 해당 패키지를 개별 추가하지 않는다.
  // 오류의 원인을 확인하고 해결하며, 패키지별 예외 목록을 누적하는 패턴을 사용하지 않는다.
  server: {
    proxy: {
      "/api": {
        target: "https://ploutosbe.duckdns.org",
        changeOrigin: true,
      },
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
      headless: true,
    },
    passWithNoTests: true,
  },
})
