import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton instance for App Router
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const client = postgres(process.env.DATABASE_URL!);
    db = drizzle(client, { schema, casing: "snake_case" });
  }
  return db;
}

// For development: direct export
export const client = postgres(process.env.DATABASE_URL!);
export default drizzle(client, { schema, casing: "snake_case" });
