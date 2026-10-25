import { db } from "@/db";
import { events, projects, todos } from "@/db/schema";
import { and, eq, gt, isNotNull, lt, or } from "drizzle-orm";
import { normalizeRepeatDays, normalizeSkipDates } from "@/lib/repeat-days";
import { deepWorkFields } from "@/lib/deep-work";

const KINDS = ["block", "plan", "note", "deep", "sleep"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = new Date(searchParams.get("start") ?? 0);
  const end = new Date(searchParams.get("end") ?? 8.64e15);
  if (isNaN(+start) || isNaN(+end)) {
    return Response.json({ error: "start and end must be ISO dates" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      notes: events.notes,
      kind: events.kind,
      start: events.start,
      end: events.end,
      allDay: events.allDay,
      repeatDays: events.repeatDays,
      skipDates: events.skipDates,
      todoId: events.todoId,
      todoIds: events.todoIds,
      goal: events.goal,
      startedAt: events.startedAt,
      stoppedAt: events.stoppedAt,
      goalAchieved: events.goalAchieved,
      focus: events.focus,
      energy: events.energy,
      interruptions: events.interruptions,
      music: events.music,
      location: events.location,
      todoStatus: todos.status,
      projectName: projects.name,
      accentColor: projects.accentColor,
    })
    .from(events)
    .leftJoin(todos, eq(events.todoId, todos.id))
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(or(isNotNull(events.repeatDays), and(lt(events.start, end), gt(events.end, start))));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const start = new Date(body.start);
  const end = new Date(body.end);
  if (!body.title?.trim() || isNaN(+start) || isNaN(+end) || end <= start) {
    return Response.json({ error: "title, start and end (after start) are required" }, { status: 400 });
  }
  const kind = KINDS.includes(body.kind) ? body.kind : "block";
  const [row] = await db
    .insert(events)
    .values({
      title: body.title,
      notes: body.notes || null,
      kind,
      start,
      end,
      allDay: !!body.allDay,
      // deep work is one-off: one row is one session
      repeatDays: kind === "deep" ? null : normalizeRepeatDays(body.repeatDays),
      skipDates: normalizeSkipDates(body.skipDates),
      todoId: body.todoId ?? null,
      ...deepWorkFields(body),
    })
    .returning();
  return Response.json(row, { status: 201 });
}
