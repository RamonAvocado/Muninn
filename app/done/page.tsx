import { db } from "@/db";
import { todos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DonePage() {
  const rows = await db.query.todos.findMany({
    where: eq(todos.status, "done"),
    orderBy: desc(todos.updatedAt),
    with: { project: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Done</h1>
      <Card>
        <CardHeader>
          <CardTitle>Everything you&apos;ve finished</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing done yet.</p>
          )}
          {rows.map((t) => (
            <div key={t.id} className="flex justify-between text-sm">
              <span className="line-through text-muted-foreground">{t.title}</span>
              <span className="text-muted-foreground">{t.project?.name ?? "Life"}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
