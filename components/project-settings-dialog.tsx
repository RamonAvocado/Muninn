"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { EyeIcon, EyeOffIcon, SettingsIcon } from "lucide-react";

export function ProjectSettingsDialog({
  projectId,
  accentColor,
  groupId,
  githubOwner,
  githubRepo,
  hasToken,
  canSync,
}: {
  projectId: string;
  accentColor: string | null;
  groupId?: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  hasToken: boolean;
  canSync: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState(accentColor);
  const [group, setGroup] = useState(groupId ?? null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [owner, setOwner] = useState(githubOwner ?? "");
  const [repo, setRepo] = useState(githubRepo ?? "");
  const [token, setToken] = useState("");
  // don't send the token field until the saved one has loaded, or Save would wipe it
  const [tokenLoaded, setTokenLoaded] = useState(!hasToken);
  const [showToken, setShowToken] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  // last values sent to the server, so blur/close only saves real changes
  const savedGithub = useRef({ owner: githubOwner ?? "", repo: githubRepo ?? "", token: "" });

  useEffect(() => {
    if (!open) return;
    fetch("/api/project-groups")
      .then((res) => res.json())
      .then(setGroups);
    if (!hasToken) return;
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return setGithubError(data.error);
        setToken(data.githubToken);
        savedGithub.current.token = data.githubToken;
        setTokenLoaded(true);
      });
  }, [open, hasToken, projectId]);

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

  async function saveGithub() {
    const next = { owner, repo, token: tokenLoaded ? token : savedGithub.current.token };
    const prev = savedGithub.current;
    if (next.owner === prev.owner && next.repo === prev.repo && next.token === prev.token) return;
    setGithubError(null);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        githubOwner: owner,
        githubRepo: repo,
        ...(tokenLoaded ? { githubToken: token } : {}),
      }),
    });
    if (!res.ok) {
      setGithubError((await res.json().catch(() => null))?.error ?? "Could not save");
      return;
    }
    savedGithub.current = next;
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) saveGithub();
        setOpen(o);
      }}
    >
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
            <Select
              value={group ?? ""}
              onValueChange={(v) => pickGroup(v ?? "")}
              items={[{ value: "", label: "Ungrouped" }, ...groups.map((g) => ({ value: g.id, label: g.name }))]}
            >
              <SelectTrigger className="w-full" aria-label="Group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ungrouped</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className="flex flex-col gap-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveGithub();
            }}
          >
            <p className="text-sm font-medium">GitHub</p>
            <div className="flex gap-2">
              <Input
                placeholder="Owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                onBlur={saveGithub}
                aria-label="GitHub owner"
              />
              <Input
                placeholder="Repository"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                onBlur={saveGithub}
                aria-label="GitHub repository"
              />
            </div>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                autoComplete="off"
                placeholder="Personal access token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onBlur={saveGithub}
                aria-label="GitHub token"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {githubError && <p className="text-sm text-destructive">{githubError}</p>}
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
