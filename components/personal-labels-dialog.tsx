"use client";

import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Modal } from "@mimird/ui/components/modal";
import { LabelManager } from "@/components/label-manager";
import { TagIcon } from "lucide-react";

export function PersonalLabelsDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <TagIcon />
        My labels
      </Button>
      <Modal open={open} onOpenChange={setOpen} title="My labels">
        <h2 className="font-heading text-base font-medium">My labels</h2>
        <LabelManager
          listUrl="/api/labels/personal"
          addUrl="/api/labels/personal"
          deleteUrlFor={(id) => `/api/labels/personal/${id}`}
        />
      </Modal>
    </>
  );
}
