"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Textarea } from "@mimird/ui/components/textarea";
import { Modal } from "@mimird/ui/components/modal";
import { cn } from "@mimird/ui/lib/utils";

export function TodoTitle({
  id,
  title,
  description,
  className,
}: {
  id: number;
  title: string;
  description: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(description ?? "");
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: value }),
    });
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("cursor-pointer text-left hover:underline", className)}
      >
        {title}
      </button>
      <Modal open={open} onOpenChange={setOpen} title={title}>
        <h2 className="font-heading text-base font-medium">{title}</h2>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Description (optional)"
          rows={6}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={save} disabled={pending}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}
