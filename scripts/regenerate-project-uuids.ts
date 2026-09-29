import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { projects, todos, projectLabels } from "../db/schema";

await db.run(sql`PRAGMA foreign_keys = OFF`);

const rows = await db.select().from(projects);

for (const row of rows) {
  const newId = crypto.randomUUID();
  await db.update(todos).set({ projectId: newId }).where(eq(todos.projectId, row.id));
  await db.update(projectLabels).set({ projectId: newId }).where(eq(projectLabels.projectId, row.id));
  await db.update(projects).set({ id: newId }).where(eq(projects.id, row.id));
  console.log(`${row.id} -> ${newId} (${row.name})`);
}

await db.run(sql`PRAGMA foreign_keys = ON`);
