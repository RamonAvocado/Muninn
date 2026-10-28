import { eq } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({ url: "file:sqlite.db" });

export const db = drizzle(client, { schema });

// --- key-value store (auth) -------------------------------------------------

export async function kvGet(key: string): Promise<unknown> {
  const row = await db.query.kv.findFirst({ where: eq(schema.kv.key, key) });
  return row ? JSON.parse(row.value) : null;
}

export async function kvSet(key: string, value: unknown) {
  const v = JSON.stringify(value);
  await db.insert(schema.kv).values({ key, value: v }).onConflictDoUpdate({ target: schema.kv.key, set: { value: v } });
}

export async function kvDel(key: string) {
  await db.delete(schema.kv).where(eq(schema.kv.key, key));
}
