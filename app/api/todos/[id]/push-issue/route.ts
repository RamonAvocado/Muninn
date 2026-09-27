import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, Number(id)),
    with: { project: true },
  });

  if (!todo || !todo.project) {
    return Response.json({ error: "Todo has no linked project" }, { status: 400 });
  }
  if (!todo.project.githubOwner || !todo.project.githubRepo) {
    return Response.json({ error: "Project has no linked GitHub repo" }, { status: 400 });
  }
  if (todo.githubIssueNumber) {
    return Response.json({ error: "Todo is already a GitHub issue" }, { status: 400 });
  }

  const labels = todo.labels ? todo.labels.split(",").map((l) => l.trim()).filter(Boolean) : [];

  const res = await fetch(
    `https://api.github.com/repos/${todo.project.githubOwner}/${todo.project.githubRepo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ title: todo.title, body: todo.description ?? "", labels }),
    },
  );
  if (!res.ok) {
    return Response.json({ error: `GitHub API error: ${res.status}` }, { status: 502 });
  }

  const issue = (await res.json()) as { number: number; html_url: string };
  const [row] = await db
    .update(todos)
    .set({
      source: "github",
      githubIssueNumber: issue.number,
      githubIssueUrl: issue.html_url,
      updatedAt: new Date(),
    })
    .where(eq(todos.id, todo.id))
    .returning();

  return Response.json(row);
}
