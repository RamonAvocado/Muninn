"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Hint } from "@mimird/ui/components/tooltip";
import { XIcon } from "lucide-react";

export function DeleteButton({ url }: { url: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Hint label="Delete">
    <Button
      variant="ghost"
      size="icon"
      loading={pending}
      aria-label="Delete"
      onClick={async () => {
        setPending(true);
        await fetch(url, { method: "DELETE" });
        router.refresh();
      }}
    >
      <XIcon className="size-4" />
    </Button>
    </Hint>
  );
}
