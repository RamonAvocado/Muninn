import { db } from "@/db";
import { todos } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  const conditions = [];
  if (projectId !== null) {
    conditions.push(projectId === "null" ? isNull(todos.projectId) : eq(todos.projectId, Number(projectId)));
  }
  if (status) {
    conditions.push(eq(todos.status, status as "todo" | "done"));
  }

  const rows = await db
    .select()
    .from(todos)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(todos.updatedAt));
  return Response.json(rows);
}

function normalizeLabels(labels: unknown): string | null {
  if (typeof labels !== "string") return null;
  return labels.split(",").map((l) => l.trim()).filter(Boolean).join(",") || null;
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(todos)
    .values({
      title: body.title,
      projectId: body.projectId ?? null,
      description: body.description || null,
      labels: normalizeLabels(body.labels),
    })
    .returning();
  return Response.json(row, { status: 201 });
}
