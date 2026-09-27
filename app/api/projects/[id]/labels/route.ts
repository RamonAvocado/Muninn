import { db } from "@/db";
import { projectLabels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEffectiveLabels } from "@/lib/labels";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  const { searchParams } = new URL(req.url);

  if (searchParams.get("resolved")) {
    return Response.json(await getEffectiveLabels(projectId));
  }
  const rows = await db.select().from(projectLabels).where(eq(projectLabels.projectId, projectId));
  return Response.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .insert(projectLabels)
    .values({ projectId: Number(id), name: body.name, color: body.color || null })
    .returning();
  return Response.json(row, { status: 201 });
}
