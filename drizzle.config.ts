import { defineConfig } from "drizzle-kit";
import { config } from "./lib";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: config.database,
  },
});
