"use client"

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_ACCENTS } from "@/lib/project-accents";
import { FolderMinusIcon } from "lucide-react";

export function ProjectCard({
  project,
  onRemoveFromGroup,
}: {
  project: {
    id: string;
    name: string;
    githubOwner: string | null;
    githubRepo: string | null;
    accentColor: string | null;
  };
  onRemoveFromGroup?: () => void;
}) {
  const router = useRouter();
  const hasRepo = project.githubOwner && project.githubRepo;
  const accent = PROJECT_ACCENTS.find((a) => a.key === project.accentColor);

  return (
    <Card
      className="group/card hover:bg-muted/50 transition-colors cursor-pointer"
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
          <span className="flex-1">{project.name}</span>
          {hasRepo && (
            <Badge variant="secondary">
              {project.githubOwner}/{project.githubRepo}
            </Badge>
          )}
          {onRemoveFromGroup && (
            <button
              type="button"
              title="Remove from group"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromGroup();
              }}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/card:opacity-100"
            >
              <FolderMinusIcon className="size-4" />
            </button>
          )}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
