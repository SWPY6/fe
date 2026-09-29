import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  out: "./feedback/migrations",
  schema: "./feedback/server/db/schema.ts",
})
