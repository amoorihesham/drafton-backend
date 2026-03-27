import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/";

export type Database = NodePgDatabase<typeof schema>;

let db: Database;

export function createDatabaseConnection(connectionString: string, poolSize: number): Database {
  const pool = new Pool({
    connectionString,
    max: poolSize,
    ssl: { rejectUnauthorized: false }, // required for Neon
  });

  db = drizzle(pool, { schema });
  return db;
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error("Database not initialized. Call createDatabaseConnection first.");
  }
  return db;
}
