"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloudIcon } from "lucide-react";

export function PushIssueButton({ todoId }: { todoId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      title="Create GitHub issue"
      onClick={async () => {
        setPending(true);
        const res = await fetch(`/api/todos/${todoId}/push-issue`, { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          toast.success("Issue created");
        } else {
          toast.error(data.error ?? "Failed to create issue");
        }
        router.refresh();
        setPending(false);
      }}
    >
      <UploadCloudIcon className={pending ? "animate-spin" : ""} />
    </Button>
  );
}
