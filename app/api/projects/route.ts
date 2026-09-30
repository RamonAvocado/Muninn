import { db } from "@/db";
import { projects, publicProjectColumns } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select(publicProjectColumns).from(projects).orderBy(desc(projects.createdAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(projects)
    .values({
      name: body.name,
      githubOwner: body.githubOwner || null,
      githubRepo: body.githubRepo || null,
      groupId: body.groupId || null,
    })
    .returning(publicProjectColumns);
  return Response.json(row, { status: 201 });
}
