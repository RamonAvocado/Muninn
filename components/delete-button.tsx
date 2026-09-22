"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export function DeleteButton({ url }: { url: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch(url, { method: "DELETE" });
        router.refresh();
      }}
    >
      <XIcon className="size-4" />
    </Button>
  );
}
