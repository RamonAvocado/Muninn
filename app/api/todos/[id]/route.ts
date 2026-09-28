import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { after } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing =
    body.status !== undefined
      ? await db.query.todos.findFirst({
          where: eq(todos.id, Number(id)),
          with: { project: true },
        })
      : undefined;

  const [row] = await db
    .update(todos)
    .set({
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      updatedAt: new Date(),
    })
    .where(eq(todos.id, Number(id)))
    .returning();

  if (
    existing?.githubIssueNumber &&
    existing.project?.githubOwner &&
    existing.project?.githubRepo
  ) {
    const { githubOwner, githubRepo } = existing.project;
    const { githubIssueNumber } = existing;
    after(async () => {
      try {
        await fetch(
          `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues/${githubIssueNumber}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github+json",
            },
            body: JSON.stringify({ state: body.status === "done" ? "closed" : "open" }),
          },
        );
      } catch {
        // best-effort: local status already updated, ignore GitHub sync failures
      }
    });
  }

  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(todos).where(eq(todos.id, Number(id)));
  return new Response(null, { status: 204 });
}
