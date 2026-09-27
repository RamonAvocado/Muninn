"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LabelManager } from "@/components/label-manager";
import { TagIcon } from "lucide-react";

export function PersonalLabelsDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <TagIcon />
        My labels
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My labels</DialogTitle>
        </DialogHeader>
        <LabelManager
          listUrl="/api/labels/personal"
          addUrl="/api/labels/personal"
          deleteUrlFor={(id) => `/api/labels/personal/${id}`}
        />
      </DialogContent>
    </Dialog>
  );
}
