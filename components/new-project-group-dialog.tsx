"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Hint } from "@mimird/ui/components/tooltip";
import { Input } from "@mimird/ui/components/input";
import { Modal } from "@mimird/ui/components/modal";
import { FolderPlusIcon } from "lucide-react";

export function NewProjectGroupDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    await fetch("/api/project-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Hint label="New Group">
        <Button variant="outline" size="icon" aria-label="New group" onClick={() => setOpen(true)}>
          <FolderPlusIcon />
        </Button>
      </Hint>
      <Modal open={open} onOpenChange={setOpen} title="New group">
        <h2 className="font-heading text-base font-medium">New group</h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            required
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
