import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

const isProduction = process.env.NODE_ENV === "production";

function createDb() {
  if (isProduction) {
    // Use Neon for production
    const sql = neon(process.env.DATABASE_URL!);
    return drizzleNeon({ client: sql, schema });
  }
  // Use node-postgres for local development
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  return drizzleNode({ client: pool, schema });
}

export const db = createDb();
