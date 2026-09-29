"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectLabelsSection } from "@/components/project-labels-section";
import { PROJECT_ACCENTS } from "@/lib/project-accents";
import { SettingsIcon } from "lucide-react";

export function ProjectSettingsDialog({
  projectId,
  accentColor,
  groupId,
  canSync,
}: {
  projectId: string;
  accentColor: string | null;
  groupId?: string | null;
  canSync: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState(accentColor);
  const [group, setGroup] = useState(groupId ?? null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/project-groups")
      .then((res) => res.json())
      .then(setGroups);
  }, [open]);

  async function pickAccent(key: string | null) {
    setAccent(key);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accentColor: key }),
    });
    router.refresh();
  }

  async function pickGroup(id: string) {
    setGroup(id || null);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: id || null }),
    });
    router.refresh();
  }

  async function deleteProject() {
    if (!confirm("Delete this project? This also deletes its todos and labels.")) return;
    setDeleting(true);
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    router.push("/projects");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon" />}>
        <SettingsIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Accent</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => pickAccent(null)}
                className="size-6 rounded-full border border-dashed border-muted-foreground/40"
                aria-label="No accent"
              />
              {PROJECT_ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => pickAccent(a.key)}
                  className="size-6 rounded-full ring-offset-2 ring-offset-popover"
                  style={{
                    backgroundColor: a.hex,
                    boxShadow: accent === a.key ? `0 0 0 2px ${a.hex}` : undefined,
                  }}
                  aria-label={a.key}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Group</p>
            <select
              value={group ?? ""}
              onChange={(e) => pickGroup(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="">Ungrouped</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Labels</p>
            <ProjectLabelsSection projectId={projectId} canSync={canSync} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" disabled={deleting} onClick={deleteProject}>
            Delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
