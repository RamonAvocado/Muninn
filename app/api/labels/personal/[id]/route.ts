import { db } from "@/db";
import { personalLabels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(personalLabels).where(eq(personalLabels.id, Number(id)));
  return new Response(null, { status: 204 });
}
