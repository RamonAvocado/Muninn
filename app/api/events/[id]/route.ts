import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizeRepeatDays, normalizeSkipDates } from "@/lib/repeat-days";
import { deepWorkFields } from "@/lib/deep-work";

const KINDS = ["block", "plan", "note", "deep", "sleep"] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(events)
    .set({
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
      ...(KINDS.includes(body.kind) ? { kind: body.kind } : {}),
      ...(body.start !== undefined ? { start: new Date(body.start) } : {}),
      ...(body.end !== undefined ? { end: new Date(body.end) } : {}),
      ...(body.allDay !== undefined ? { allDay: !!body.allDay } : {}),
      ...(body.repeatDays !== undefined || body.kind === "deep"
        ? { repeatDays: body.kind === "deep" ? null : normalizeRepeatDays(body.repeatDays) }
        : {}),
      ...(body.skipDates !== undefined ? { skipDates: normalizeSkipDates(body.skipDates) } : {}),
      ...deepWorkFields(body),
    })
    .where(eq(events.id, Number(id)))
    .returning();
  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(events).where(eq(events.id, Number(id)));
  return new Response(null, { status: 204 });
}
