"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import type { EventApi, EventInput } from "@fullcalendar/core";
import { ChevronDown } from "lucide-react";
import { PROJECT_ACCENTS } from "@/lib/project-accents";
import { EventDialog, type EventDraft } from "@/components/event-dialog";

type PendingTodo = {
  id: number;
  title: string;
  projectName: string | null;
  accentColor: string | null;
};

type EventRow = {
  id: number;
  title: string;
  notes: string | null;
  kind: EventDraft["kind"];
  start: string;
  end: string;
  allDay: boolean;
  repeatDays: string | null;
  todoId: number | null;
  todoStatus: "todo" | "done" | null;
  projectName: string | null;
  accentColor: string | null;
};

const accentHex = (key: string | null) => PROJECT_ACCENTS.find((a) => a.key === key)?.hex;

function toInput(row: EventRow): EventInput {
  const color = accentHex(row.accentColor);
  return {
    id: String(row.id),
    title: row.projectName ? `${row.title} · ${row.projectName}` : row.title,
    ...(row.repeatDays ? repeating(row) : { start: row.start, end: row.end }),
    allDay: row.allDay,
    backgroundColor: color,
    borderColor: color,
    classNames: [`muninn-${row.kind}`, row.todoStatus === "done" ? "muninn-done" : ""],
    extendedProps: { row },
  };
}

// the stored start/end is the first occurrence: it anchors the series and sets time and length
function repeating(row: EventRow): EventInput {
  const start = new Date(row.start);
  const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    daysOfWeek: row.repeatDays!.split(",").map(Number),
    startRecur: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
    ...(row.allDay ? {} : { startTime: hhmm(start), duration: { milliseconds: +new Date(row.end) - +start } }),
  };
}

async function patchTimes(event: EventApi, revert: () => void, refetch: () => void) {
  const row: EventRow = event.extendedProps.row;
  let start = event.start!;
  // FullCalendar leaves end null when it equals the default duration
  const length = +(event.end ?? +start + (event.allDay ? 864e5 : 36e5)) - +start;
  if (row.repeatDays) {
    // dragging one occurrence moves the time of the whole series, keeping its first day
    const anchor = new Date(row.start);
    anchor.setHours(start.getHours(), start.getMinutes(), 0, 0);
    start = anchor;
  }
  const res = await fetch(`/api/events/${event.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end: new Date(+start + length), allDay: event.allDay }),
  });
  if (!res.ok) revert();
  else if (row.repeatDays) refetch();
}

export function CalendarView({ todos }: { todos: PendingTodo[] }) {
  const calendarRef = useRef<FullCalendar>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<EventDraft | null>(null);

  useEffect(() => {
    const draggable = new Draggable(panelRef.current!, {
      itemSelector: "[data-todo]",
      eventData: (el) => ({
        title: el.dataset.title,
        duration: "00:30",
        extendedProps: { todoId: Number(el.dataset.todo) },
      }),
    });
    return () => draggable.destroy();
  }, []);

  const refetch = () => calendarRef.current?.getApi().refetchEvents();

  const groups = Object.entries(
    Object.groupBy(todos, (t) => t.projectName ?? "Personal"),
  );

  return (
    <div className="flex gap-6">
      <div ref={panelRef} className="flex w-56 shrink-0 flex-col gap-4">
        {todos.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
        {groups.map(([project, items]) => (
          // ponytail: native <details>, open state is not remembered across reloads
          <details key={project} open className="group/project">
            <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <ChevronDown className="size-3.5 -rotate-90 transition-transform group-open/project:rotate-0" aria-hidden />
              {accentHex(items![0].accentColor) && (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: accentHex(items![0].accentColor) }}
                />
              )}
              <span className="truncate">{project}</span>
              <span className="ml-auto tabular-nums">{items!.length}</span>
            </summary>
            <div className="flex flex-col gap-1">
              {items!.map((t) => (
                <div
                  key={t.id}
                  data-todo={t.id}
                  data-title={t.title}
                  className="cursor-grab rounded-md px-2 py-1 text-sm ring-1 ring-foreground/10 hover:bg-accent"
                >
                  {t.title}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          firstDay={1}
          height="auto"
          scrollTime="08:00"
          nowIndicator
          selectable
          selectMirror
          editable
          droppable
          events={(info, success, failure) =>
            fetch(`/api/events?start=${info.startStr}&end=${info.endStr}`)
              .then((r) => r.json())
              .then((rows: EventRow[]) => success(rows.map(toInput)))
              .catch(failure)
          }
          select={(info) => {
            info.view.calendar.unselect();
            setDraft({
              title: "",
              notes: "",
              kind: info.allDay ? "note" : "block",
              start: info.start,
              end: info.end,
              allDay: info.allDay,
              repeatDays: [],
            });
          }}
          eventClick={({ event }) => {
            const row: EventRow = event.extendedProps.row;
            setDraft({
              id: row.id,
              title: row.title,
              notes: row.notes ?? "",
              kind: row.kind,
              start: new Date(row.start),
              end: new Date(row.end),
              allDay: row.allDay,
              repeatDays: row.repeatDays?.split(",").map(Number) ?? [],
            });
          }}
          eventDrop={({ event, revert }) => patchTimes(event, revert, refetch)}
          eventResize={({ event, revert }) => patchTimes(event, revert, refetch)}
          eventReceive={async ({ event, revert }) => {
            const res = await fetch("/api/events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: event.title,
                kind: "plan",
                start: event.start,
                end: event.end ?? new Date(+event.start! + (event.allDay ? 864e5 : 18e5)),
                allDay: event.allDay,
                todoId: event.extendedProps.todoId,
              }),
            });
            // drop the temporary copy; the refetch brings back the saved one with project colors
            revert();
            if (res.ok) refetch();
          }}
        />
      </div>

      {draft && (
        <EventDialog
          key={draft.id ?? +draft.start}
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
