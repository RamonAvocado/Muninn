import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { NewIdeaForm } from "@/components/new-idea-form";
import { DeleteButton } from "@/components/delete-button";
import { IdeaItem } from "@/components/idea-item";

export default async function IdeasPage() {
  const rows = await db.select().from(ideas).orderBy(desc(ideas.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Ideas</h1>

      <Card>
        <CardContent className="pt-6">
          <NewIdeaForm />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No ideas yet.</p>
        )}
        {rows.map((idea) => (
          <Card key={idea.id}>
            <CardContent className="flex flex-row items-start justify-between gap-2 pt-6">
              <IdeaItem title={idea.title} body={idea.body} className="flex-1" />
              <DeleteButton url={`/api/ideas/${idea.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
