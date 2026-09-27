import { db } from "@/db";
import { personalLabels } from "@/db/schema";
import { getPersonalLabels } from "@/lib/labels";

export async function GET() {
  return Response.json(await getPersonalLabels());
}

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db
    .insert(personalLabels)
    .values({ name: body.name, color: body.color || null })
    .returning();
  return Response.json(row, { status: 201 });
}
