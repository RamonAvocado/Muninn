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
import { ProjectSettingsDialog } from "@/components/project-settings-dialog";
import { PushIssueButton } from "@/components/push-issue-button";
import { DeleteButton } from "@/components/delete-button";
import { PROJECT_ACCENTS } from "@/lib/project-accents";

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
  const accent = PROJECT_ACCENTS.find((a) => a.key === project.accentColor);
  const hasRepo = !!(project.githubOwner && project.githubRepo);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          {accent && (
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: accent.hex }}
            />
          )}
          {hasRepo ? (
            <a
              href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h1>
        <div className="flex gap-2">
          {hasRepo && <SyncButton projectId={project.id} />}
          <ProjectSettingsDialog
            projectId={project.id}
            accentColor={project.accentColor}
            canSync={hasRepo}
          />
        </div>
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
