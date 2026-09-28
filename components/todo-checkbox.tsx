"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function TodoCheckbox({ id, done }: { id: number; done: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(done);
  const [pending, setPending] = useState(false);

  return (
    <Checkbox
      checked={checked}
      disabled={pending}
      onCheckedChange={async (next) => {
        setChecked(next);
        setPending(true);
        await fetch(`/api/todos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next ? "done" : "todo" }),
        });
        router.refresh();
        setPending(false);
      }}
    />
  );
}
