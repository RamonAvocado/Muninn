import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(ideas).orderBy(desc(ideas.createdAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(ideas)
    .values({ title: body.title, body: body.body || null })
    .returning();
  return Response.json(row, { status: 201 });
}
