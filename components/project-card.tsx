"use client"

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({
  project,
}: {
  project: {
    id: number;
    name: string;
    githubOwner: string | null;
    githubRepo: string | null;
  };
}) {
  const router = useRouter();
  const hasRepo = project.githubOwner && project.githubRepo;

  return (
    <Card
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasRepo ? (
            <a
              href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
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
