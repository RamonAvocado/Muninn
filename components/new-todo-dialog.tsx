"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ListPlusIcon, XIcon } from "lucide-react";
import { cn } from "cn";

export function NewTodoDialog({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState<{ name: string; color: string | null }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const url = projectId ? `/api/projects/${projectId}/labels?resolved=1` : "/api/labels/personal";
    fetch(url)
      .then((res) => res.json())
      .then(setAvailable);
  }, [open, projectId]);

  function toggleLabel(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        projectId,
        description,
        labels: Array.from(selected).join(","),
      }),
    });
    setTitle("");
    setDescription("");
    setSelected(new Set());
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon" title="New todo" />}>
        <ListPlusIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New todo</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          {available.length > 0 && (
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border p-1">
              {available.map((label) => {
                const isSelected = selected.has(label.name);
                return (
                  <button
                    key={label.name}
                    type="button"
                    onClick={() => toggleLabel(label.name)}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                      isSelected ? "bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full",
                        !label.color && "border border-dashed border-muted-foreground/40"
                      )}
                      style={{ backgroundColor: label.color ? `#${label.color}` : undefined }}
                    >
                      {isSelected && <XIcon className="size-3 text-white" />}
                    </span>
                    {label.name}
                  </button>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
