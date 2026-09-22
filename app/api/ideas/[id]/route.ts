import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(ideas)
    .set({
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.body !== undefined ? { body: body.body || null } : {}),
    })
    .where(eq(ideas.id, Number(id)))
    .returning();
  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(ideas).where(eq(ideas.id, Number(id)));
  return new Response(null, { status: 204 });
}
