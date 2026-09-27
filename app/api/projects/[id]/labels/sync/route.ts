import { db } from "@/db";
import { projects, projectLabels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);

  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project?.githubOwner || !project?.githubRepo) {
    return Response.json({ error: "No linked GitHub repo" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${project.githubOwner}/${project.githubRepo}/labels?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
  if (!res.ok) {
    return Response.json({ error: `GitHub API error: ${res.status}` }, { status: 502 });
  }

  const githubLabels = (await res.json()) as { name: string; color: string }[];

  await db.delete(projectLabels).where(eq(projectLabels.projectId, projectId));
  if (githubLabels.length > 0) {
    await db
      .insert(projectLabels)
      .values(githubLabels.map((l) => ({ projectId, name: l.name, color: l.color })));
  }

  return Response.json({ synced: githubLabels.length });
}
