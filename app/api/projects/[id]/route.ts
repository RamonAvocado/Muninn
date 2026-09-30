import { db } from "@/db";
import { projects, publicProjectColumns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptToken, encryptToken } from "@/lib/github-sync";

// only the settings dialog calls this, to show the saved token behind the eye toggle
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    return Response.json({ githubToken: project.githubToken ? decryptToken(project.githubToken) : "" });
  } catch {
    return Response.json({ error: "Saved token can't be decrypted (TOKEN_SECRET changed?)" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const token = body.githubToken?.trim();
  if (token && !process.env.TOKEN_SECRET) {
    return Response.json({ error: "TOKEN_SECRET is not set on the server" }, { status: 500 });
  }
  const [row] = await db
    .update(projects)
    .set({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.githubOwner !== undefined ? { githubOwner: body.githubOwner?.trim() || null } : {}),
      ...(body.githubRepo !== undefined ? { githubRepo: body.githubRepo?.trim() || null } : {}),
      ...(body.githubToken !== undefined ? { githubToken: token ? encryptToken(token) : null } : {}),
      ...(body.accentColor !== undefined ? { accentColor: body.accentColor || null } : {}),
      ...(body.groupId !== undefined ? { groupId: body.groupId || null } : {}),
    })
    .where(eq(projects.id, id))
    .returning(publicProjectColumns);
  return Response.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, id));
  return new Response(null, { status: 204 });
}
