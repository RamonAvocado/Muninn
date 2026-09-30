import { db } from "@/db";
import { projects, todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { githubHeaders, toTodoRow, type GithubIssue } from "@/lib/github-sync";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = id;

  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project?.githubOwner || !project?.githubRepo) {
    return Response.json({ error: "No linked GitHub repo" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${project.githubOwner}/${project.githubRepo}/issues?state=all&per_page=100`,
    {
      headers: githubHeaders(project),
    },
  );
  if (!res.ok) {
    return Response.json({ error: `GitHub API error: ${res.status}` }, { status: 502 });
  }

  const issues = (await res.json()) as GithubIssue[];
  let synced = 0;
  for (const issue of issues) {
    if (issue.pull_request) continue;
    const row = toTodoRow(issue, projectId);
    await db
      .insert(todos)
      .values(row)
      .onConflictDoUpdate({
        target: [todos.projectId, todos.githubIssueNumber],
        set: row,
      });
    synced++;
  }

  return Response.json({ synced });
}
