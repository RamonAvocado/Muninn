"use client";

import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderIcon } from "lucide-react";

export function ProjectGroupCard({
  group,
  isDropTarget,
}: {
  group: { id: string; name: string };
  isDropTarget?: boolean;
}) {
  const router = useRouter();

  return (
    <Card
      className={cn(
        "hover:bg-muted/50 transition-colors cursor-pointer",
        isDropTarget && "ring-2 ring-primary bg-muted/50"
      )}
      onClick={() => router.push(`/projects/groups/${group.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
          {group.name}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
