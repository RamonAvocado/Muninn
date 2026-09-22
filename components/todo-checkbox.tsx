"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function TodoCheckbox({ id, done }: { id: number; done: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Checkbox
      checked={done}
      disabled={pending}
      onCheckedChange={async (checked) => {
        setPending(true);
        await fetch(`/api/todos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: checked ? "done" : "todo" }),
        });
        router.refresh();
        setPending(false);
      }}
    />
  );
}
