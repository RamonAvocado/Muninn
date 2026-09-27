import { db } from "@/db";
import { projects, todos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TodoCheckbox } from "@/components/todo-checkbox";
import { QuickAddTodo } from "@/components/quick-add-todo";
import { NewTodoDialog } from "@/components/new-todo-dialog";
import { SyncButton } from "@/components/sync-button";
import { PushIssueButton } from "@/components/push-issue-button";
import { DeleteButton } from "@/components/delete-button";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, Number(id)),
    with: { todos: { orderBy: asc(todos.createdAt) } },
  });

  if (!project) notFound();

  const open = project.todos.filter((t) => t.status === "todo");
  const done = project.todos.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{project.name}</h1>
        {project.githubOwner && project.githubRepo && (
          <SyncButton projectId={project.id} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <QuickAddTodo projectId={project.id} />
            <NewTodoDialog projectId={project.id} />
          </div>
          {open.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing pending.</p>
          )}
          {open.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <TodoCheckbox id={t.id} done={false} />
              <span className="flex-1">{t.title}</span>
              {t.labels && (
                <div className="flex gap-1">
                  {t.labels.split(",").map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              {t.githubIssueUrl && (
                <a
                  href={t.githubIssueUrl}
                  target="_blank"
                  className="text-xs text-muted-foreground underline"
                >
                  #{t.githubIssueNumber}
                </a>
              )}
              {t.source === "manual" && !t.githubIssueNumber && project.githubOwner && project.githubRepo && (
                <PushIssueButton todoId={t.id} />
              )}
              <DeleteButton url={`/api/todos/${t.id}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Done</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {done.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing done yet.</p>
          )}
          {done.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <TodoCheckbox id={t.id} done={true} />
              <span className="flex-1 line-through text-muted-foreground">{t.title}</span>
              {t.githubIssueUrl && (
                <a
                  href={t.githubIssueUrl}
                  target="_blank"
                  className="text-xs text-muted-foreground underline"
                >
                  #{t.githubIssueNumber}
                </a>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
