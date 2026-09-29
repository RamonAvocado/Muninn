import { db } from "@/db";
import { projects, projectGroups } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const body = await req.json();
  const items = body.items as { id: string; kind: "project" | "group" }[];

  await db.transaction(async (tx) => {
    for (let i = 0; i < items.length; i++) {
      const { id, kind } = items[i];
      if (kind === "group") {
        await tx.update(projectGroups).set({ order: i }).where(eq(projectGroups.id, id));
      } else {
        await tx.update(projects).set({ order: i }).where(eq(projects.id, id));
      }
    }
  });

  return new Response(null, { status: 204 });
}
