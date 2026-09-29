import { db } from "@/db";
import { projectGroups } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(projectGroups).orderBy(asc(projectGroups.order));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db.insert(projectGroups).values({ name: body.name }).returning();
  return Response.json(row, { status: 201 });
}
