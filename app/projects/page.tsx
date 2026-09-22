import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewProjectDialog } from "@/components/new-project-dialog";

export default async function ProjectsPage() {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <NewProjectDialog />
      </div>
      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}
        {rows.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {p.name}
                  {p.githubOwner && p.githubRepo && (
                    <Badge variant="secondary">
                      {p.githubOwner}/{p.githubRepo}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
