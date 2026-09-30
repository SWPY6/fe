import { defineConfig } from "orval"

export default defineConfig({
  api: {
    input: {
      target: "./src/api/openapi.json",
    },
    output: {
      target: "./src/api/generated/api.ts",
      client: "axios-functions",
      mode: "split",
      clean: true,
      mock: {
        generators: [{ type: "msw", useExamples: true }],
      },
      override: {
        mutator: {
          path: "./src/api/http/client.ts",
          name: "apiRequest",
        },
      },
    },
  },
})
