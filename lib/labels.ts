import { db } from "@/db";
import { personalLabels, projectLabels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_LABELS } from "@/lib/default-labels";

export async function getPersonalLabels() {
  const rows = await db.select().from(personalLabels);
  if (rows.length > 0) return rows;
  await db.insert(personalLabels).values(DEFAULT_LABELS);
  return db.select().from(personalLabels);
}

export async function getEffectiveLabels(projectId: number) {
  const rows = await db.select().from(projectLabels).where(eq(projectLabels.projectId, projectId));
  return rows.length > 0 ? rows : getPersonalLabels();
}
