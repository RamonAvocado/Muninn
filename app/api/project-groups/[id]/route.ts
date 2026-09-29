import { db } from "@/db";
import { projectGroups } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(projectGroups)
    .set({
      ...(body.name !== undefined ? { name: body.name } : {}),
    })
    .where(eq(projectGroups.id, id))
    .returning();
  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(projectGroups).where(eq(projectGroups.id, id));
  return new Response(null, { status: 204 });
}
