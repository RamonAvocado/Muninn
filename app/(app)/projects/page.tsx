import { db } from "@/db";
import { projects, projectGroups, publicProjectColumns } from "@/db/schema";
import { asc, isNull } from "drizzle-orm";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { NewProjectGroupDialog } from "@/components/new-project-group-dialog";
import { PersonalLabelsDialog } from "@/components/personal-labels-dialog";
import { ProjectList, type ProjectListItem } from "@/components/project-list";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [groups, ungroupedProjects] = await Promise.all([
    db.select().from(projectGroups).orderBy(asc(projectGroups.order), asc(projectGroups.createdAt)),
    db
      .select(publicProjectColumns)
      .from(projects)
      .where(isNull(projects.groupId))
      .orderBy(asc(projects.order), asc(projects.createdAt)),
  ]);

  const items: ProjectListItem[] = [
    ...groups.map((g) => ({ kind: "group" as const, group: g })),
    ...ungroupedProjects.map((p) => ({ kind: "project" as const, project: p })),
  ].sort((a, b) => {
    const orderA = a.kind === "group" ? a.group.order : a.project.order;
    const orderB = b.kind === "group" ? b.group.order : b.project.order;
    return orderA - orderB;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="flex gap-2">
          <PersonalLabelsDialog />
          <NewProjectGroupDialog />
          <NewProjectDialog />
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ProjectList items={items} />
      )}
    </div>
  );
}
