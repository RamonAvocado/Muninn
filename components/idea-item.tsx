"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "cn"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible"

export function IdeaItem({
  title,
  body,
  className,
}: {
  title: string
  body: string | null
  className?: string
}) {
  if (!body) {
    return <div className={cn("text-sm py-1", className)}>{title}</div>
  }

  return (
    <Collapsible className={cn("text-sm", className)}>
      <CollapsibleTrigger className="flex w-full items-center gap-1 py-1 text-left">
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform data-panel-open:rotate-90" />
        {title}
      </CollapsibleTrigger>
      <CollapsiblePanel className="pl-[1.125rem] text-muted-foreground whitespace-pre-wrap">
        {body}
      </CollapsiblePanel>
    </Collapsible>
  )
}
