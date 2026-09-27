import { db } from "@/db";
import { projectLabels } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; labelId: string }> },
) {
  const { id, labelId } = await params;
  await db
    .delete(projectLabels)
    .where(and(eq(projectLabels.projectId, Number(id)), eq(projectLabels.id, Number(labelId))));
  return new Response(null, { status: 204 });
}
