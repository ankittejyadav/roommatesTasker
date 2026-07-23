import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

export const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

export * from "./schema";
