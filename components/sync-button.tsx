"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

export function SyncButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const res = await fetch(`/api/projects/${projectId}/sync`, { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Synced ${data.synced} issue${data.synced === 1 ? "" : "s"}`);
        } else {
          toast.error(data.error ?? "Sync failed");
        }
        router.refresh();
        setPending(false);
      }}
    >
      <RefreshCwIcon className={pending ? "animate-spin" : ""} />
      Sync with GitHub
    </Button>
  );
}
