import { db } from "@/db";
import { projects, todos } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { CalendarView } from "@/components/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const pending = await db
    .select({
      id: todos.id,
      title: todos.title,
      projectName: projects.name,
      accentColor: projects.accentColor,
    })
    .from(todos)
    .leftJoin(projects, eq(todos.projectId, projects.id))
    .where(eq(todos.status, "todo"))
    .orderBy(asc(projects.order), asc(todos.createdAt));

  return (
    <div data-wide className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Calendar</h1>
      <CalendarView todos={pending} />
    </div>
  );
}
