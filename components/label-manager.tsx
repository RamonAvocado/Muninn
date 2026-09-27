"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, XIcon } from "lucide-react";

type Label = { id: number; name: string; color: string | null };

export function LabelManager({
  listUrl,
  addUrl,
  deleteUrlFor,
}: {
  listUrl: string;
  addUrl: string;
  deleteUrlFor: (id: number) => string;
}) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [pending, setPending] = useState(false);

  function refetch() {
    fetch(listUrl)
      .then((res) => res.json())
      .then(setLabels);
  }

  useEffect(refetch, [listUrl]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    await fetch(addUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), color: color.trim() || undefined }),
    });
    setName("");
    setColor("");
    setPending(false);
    refetch();
  }

  async function remove(id: number) {
    await fetch(deleteUrlFor(id), { method: "DELETE" });
    refetch();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 && <p className="text-sm text-muted-foreground">No labels yet.</p>}
        {labels.map((label) => (
          <Badge key={label.id} variant="secondary" className="gap-1.5">
            {label.color && (
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: `#${label.color}` }}
              />
            )}
            {label.name}
            <button type="button" onClick={() => remove(label.id)} className="cursor-pointer">
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Label name"
          className="h-8"
        />
        <Input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="Color hex (optional)"
          className="h-8"
        />
        <Button type="submit" size="icon" disabled={pending}>
          <PlusIcon />
        </Button>
      </form>
    </div>
  );
}
