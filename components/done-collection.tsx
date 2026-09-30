"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { TodoCheckbox } from "@/components/todo-checkbox";
import { TodoTitle } from "@/components/todo-title";

type DoneTodo = {
  id: number;
  title: string;
  description: string | null;
  githubIssueUrl: string | null;
  githubIssueNumber: number | null;
};

export function DoneCollection({ todos }: { todos: DoneTodo[] }) {
  return (
    <Collapsible defaultOpen={todos.length <= 5} className="flex flex-col gap-2">
      <CollapsibleTrigger className="flex items-center gap-1 text-left text-sm font-medium text-muted-foreground">
        <ChevronRight className="size-3.5 shrink-0 transition-transform data-panel-open:rotate-90" />
        {todos.length} done
      </CollapsibleTrigger>
      <CollapsiblePanel className="flex flex-col gap-2">
        {todos.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <TodoCheckbox id={t.id} done={true} />
            <TodoTitle
              id={t.id}
              title={t.title}
              description={t.description}
              className="flex-1 line-through text-muted-foreground"
            />
            {t.githubIssueUrl && (
              <a
                href={t.githubIssueUrl}
                target="_blank"
                className="text-xs text-muted-foreground underline"
              >
                #{t.githubIssueNumber}
              </a>
            )}
          </div>
        ))}
      </CollapsiblePanel>
    </Collapsible>
  );
}
