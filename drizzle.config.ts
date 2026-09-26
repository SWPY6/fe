import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  out: "./migrations/agentation",
  schema: "./server/agentation/db/schema.ts",
})
