import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
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
    .returning();
  return Response.json(row, { status: 201 });
}
