"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

export function SyncLabelsButton({
  projectId,
  onSynced,
}: {
  projectId: number;
  onSynced?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const res = await fetch(`/api/projects/${projectId}/labels/sync`, { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Synced ${data.synced} label${data.synced === 1 ? "" : "s"}`);
          onSynced?.();
        } else {
          toast.error(data.error ?? "Sync failed");
        }
        router.refresh();
        setPending(false);
      }}
    >
      <RefreshCwIcon className={pending ? "animate-spin" : ""} />
      Sync from GitHub
    </Button>
  );
}
