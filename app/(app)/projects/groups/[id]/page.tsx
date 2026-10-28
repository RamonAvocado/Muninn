import { db } from "@/db";
import { projects, projectGroups, publicProjectColumns } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { ProjectList, type ProjectListItem } from "@/components/project-list";

export const dynamic = "force-dynamic";

export default async function ProjectGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await db.query.projectGroups.findFirst({ where: eq(projectGroups.id, id) });
  if (!group) notFound();

  const rows = await db
    .select(publicProjectColumns)
    .from(projects)
    .where(eq(projects.groupId, id))
    .orderBy(asc(projects.order), asc(projects.createdAt));

  const items: ProjectListItem[] = rows.map((p) => ({ kind: "project" as const, project: p }));

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/projects"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Projects
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{group.name}</h1>
        <NewProjectDialog groupId={group.id} />
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects in this group yet.</p>
      ) : (
        <ProjectList items={items} showRemoveFromGroup />
      )}
    </div>
  );
}
