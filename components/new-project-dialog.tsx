"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Input } from "@mimird/ui/components/input";
import { Modal } from "@mimird/ui/components/modal";

export function NewProjectDialog({ groupId }: { groupId?: string } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, githubOwner, githubRepo, groupId }),
    });
    setName("");
    setGithubOwner("");
    setGithubRepo("");
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Project</Button>
      <Modal open={open} onOpenChange={setOpen} title="New project">
        <h2 className="font-heading text-base font-medium">New project</h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            required
          />
          <Input
            value={githubOwner}
            onChange={(e) => setGithubOwner(e.target.value)}
            placeholder="GitHub owner (optional)"
          />
          <Input
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            placeholder="GitHub repo (optional)"
          />
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
