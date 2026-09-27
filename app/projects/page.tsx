import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { PersonalLabelsDialog } from "@/components/personal-labels-dialog";
import { ProjectCard } from "@/components/project-card";

export default async function ProjectsPage() {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="flex gap-2">
          <PersonalLabelsDialog />
          <NewProjectDialog />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}
        {rows.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
