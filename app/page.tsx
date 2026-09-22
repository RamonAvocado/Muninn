import { db } from "@/db";
import { todos, ideas } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoCheckbox } from "@/components/todo-checkbox";
import { QuickAddTodo } from "@/components/quick-add-todo";

export default async function DashboardPage() {
  const [openLifeTodos, recentDone, recentIdeas] = await Promise.all([
    db
      .select()
      .from(todos)
      .where(and(isNull(todos.projectId), eq(todos.status, "todo")))
      .orderBy(desc(todos.createdAt)),
    db.query.todos.findMany({
      where: eq(todos.status, "done"),
      orderBy: desc(todos.updatedAt),
      limit: 5,
      with: { project: true },
    }),
    db.select().from(ideas).orderBy(desc(ideas.createdAt)).limit(3),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Life todos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <QuickAddTodo />
          {openLifeTodos.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing pending.</p>
          )}
          {openLifeTodos.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <TodoCheckbox id={t.id} done={t.status === "done"} />
              <span>{t.title}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently done</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {recentDone.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing done yet.</p>
          )}
          {recentDone.map((t) => (
            <div key={t.id} className="flex justify-between text-sm">
              <span className="line-through text-muted-foreground">{t.title}</span>
              <span className="text-muted-foreground">{t.project?.name ?? "Life"}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ideas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {recentIdeas.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No ideas yet. <Link href="/ideas" className="underline">Jot one down</Link>.
            </p>
          )}
          {recentIdeas.map((i) => (
            <div key={i.id} className="text-sm">
              {i.title}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
