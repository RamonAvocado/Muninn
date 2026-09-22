import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(projects)
    .set({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.githubOwner !== undefined ? { githubOwner: body.githubOwner || null } : {}),
      ...(body.githubRepo !== undefined ? { githubRepo: body.githubRepo || null } : {}),
    })
    .where(eq(projects.id, Number(id)))
    .returning();
  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, Number(id)));
  return new Response(null, { status: 204 });
}
