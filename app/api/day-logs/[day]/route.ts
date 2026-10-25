import { db } from "@/db";
import { dayLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

const isDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day);

export async function GET(_req: Request, { params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  if (!isDay(day)) return Response.json({ error: "day must be YYYY-MM-DD" }, { status: 400 });
  const [row] = await db.select().from(dayLogs).where(eq(dayLogs.day, day));
  return Response.json(row ?? { day, sleepHours: null, exercise: null, caffeine: null, meetings: null });
}

export async function PUT(req: Request, { params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  if (!isDay(day)) return Response.json({ error: "day must be YYYY-MM-DD" }, { status: 400 });
  const body = await req.json();
  const hours = Number(body.sleepHours);
  const values = {
    sleepHours: body.sleepHours === null || body.sleepHours === "" || !(hours >= 0 && hours <= 24) ? null : hours,
    exercise: typeof body.exercise === "boolean" ? body.exercise : null,
    caffeine: body.caffeine?.trim() || null,
    meetings: body.meetings?.trim() || null,
  };
  const [row] = await db
    .insert(dayLogs)
    .values({ day, ...values })
    .onConflictDoUpdate({ target: dayLogs.day, set: values })
    .returning();
  return Response.json(row);
}
