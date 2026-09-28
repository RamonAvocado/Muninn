"use client"

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_ACCENTS } from "@/lib/project-accents";

export function ProjectCard({
  project,
}: {
  project: {
    id: number;
    name: string;
    githubOwner: string | null;
    githubRepo: string | null;
    accentColor: string | null;
  };
}) {
  const router = useRouter();
  const hasRepo = project.githubOwner && project.githubRepo;
  const accent = PROJECT_ACCENTS.find((a) => a.key === project.accentColor);

  return (
    <Card
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {accent && (
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: accent.hex }}
            />
          )}
          {project.name}
          {hasRepo && (
            <Badge variant="secondary">
              {project.githubOwner}/{project.githubRepo}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
