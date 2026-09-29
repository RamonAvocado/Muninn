"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { ProjectGroupCard } from "@/components/project-group-card";

export type ProjectListItem =
  | {
      kind: "project";
      project: {
        id: string;
        name: string;
        githubOwner: string | null;
        githubRepo: string | null;
        accentColor: string | null;
      };
    }
  | { kind: "group"; group: { id: string; name: string } };

function itemId(item: ProjectListItem) {
  return item.kind === "project" ? item.project.id : item.group.id;
}

export function ProjectList({
  items: initialItems,
  showRemoveFromGroup,
}: {
  items: ProjectListItem[];
  showRemoveFromGroup?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [dropGroupId, setDropGroupId] = useState<string | null>(null);
  const draggedId = useRef<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync after a server refresh
    setItems(initialItems);
  }, [initialItems]);

  function handleDragOver(e: React.DragEvent, overIndex: number) {
    e.preventDefault();
    const fromId = draggedId.current;
    if (fromId === null) return;
    const fromIndex = items.findIndex((item) => itemId(item) === fromId);
    if (fromIndex === -1) return;
    const draggedItem = items[fromIndex];
    const overItem = items[overIndex];

    if (draggedItem.kind === "project" && overItem.kind === "group") {
      setDropGroupId(overItem.group.id);
      return;
    }
    setDropGroupId(null);
    if (fromIndex === overIndex) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(overIndex, 0, moved);
      return next;
    });
  }

  async function persistOrder(nextItems: ProjectListItem[]) {
    await fetch("/api/projects/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: nextItems.map((item) => ({ id: itemId(item), kind: item.kind })),
      }),
    });
  }

  async function handleDrop() {
    const fromId = draggedId.current;
    const targetGroupId = dropGroupId;
    draggedId.current = null;
    setDropGroupId(null);
    if (fromId === null) return;

    if (targetGroupId) {
      await fetch(`/api/projects/${fromId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: targetGroupId }),
      });
      setItems((prev) => prev.filter((item) => itemId(item) !== fromId));
      router.refresh();
      return;
    }

    await persistOrder(items);
    router.refresh();
  }

  async function removeFromGroup(id: string) {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: null }),
    });
    setItems((prev) => prev.filter((item) => itemId(item) !== id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={itemId(item)}
          draggable
          onDragStart={() => (draggedId.current = itemId(item))}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          onDragEnd={() => {
            draggedId.current = null;
            setDropGroupId(null);
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          {item.kind === "project" ? (
            <ProjectCard
              project={item.project}
              onRemoveFromGroup={showRemoveFromGroup ? () => removeFromGroup(item.project.id) : undefined}
            />
          ) : (
            <ProjectGroupCard group={item.group} isDropTarget={dropGroupId === item.group.id} />
          )}
        </div>
      ))}
    </div>
  );
}
