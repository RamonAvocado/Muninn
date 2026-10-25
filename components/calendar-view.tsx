"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import type { EventApi, EventInput } from "@fullcalendar/core";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { PROJECT_ACCENTS } from "@/lib/project-accents";
import { occurrences } from "@/lib/repeat-days";
import { EMPTY_SESSION, EventDialog, type EventDraft } from "@/components/event-dialog";
import type { CalendarTodo } from "@/components/deep-work-panel";

type EventRow = {
  id: number;
  title: string;
  notes: string | null;
  kind: EventDraft["kind"];
  start: string;
  end: string;
  allDay: boolean;
  repeatDays: string | null;
  skipDates: string | null;
  todoId: number | null;
  todoIds: string | null;
  goal: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  goalAchieved: EventDraft["goalAchieved"];
  focus: number | null;
  energy: number | null;
  interruptions: number;
  music: EventDraft["music"];
  location: string | null;
  todoStatus: "todo" | "done" | null;
  projectName: string | null;
  accentColor: string | null;
};

const accentHex = (key: string | null) => PROJECT_ACCENTS.find((a) => a.key === key)?.hex;

function toInputs(row: EventRow, from: Date, to: Date): EventInput[] {
  const color = accentHex(row.accentColor);
  const base = {
    title: row.projectName ? `${row.title} · ${row.projectName}` : row.title,
    allDay: row.allDay,
    backgroundColor: color,
    borderColor: color,
    classNames: [`muninn-${row.kind}`, row.todoStatus === "done" ? "muninn-done" : ""],
  };
  if (!row.repeatDays) {
    return [{ ...base, id: String(row.id), start: row.start, end: row.end, extendedProps: { row } }];
  }
  // groupId makes FullCalendar drag the whole series together
  return occurrences({ ...row, repeatDays: row.repeatDays }, from, to).map((o) => ({
    ...base,
    id: `${row.id}-${o.day}`,
    groupId: String(row.id),
    start: o.start,
    end: o.end,
    extendedProps: { row, day: o.day },
  }));
}

function patch(id: number, body: object) {
  return fetch(`/api/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// a toast whose Undo button runs `undo`, then reloads the calendar
function offerUndo(message: string, undo: () => Promise<Response>, refetch: () => void) {
  toast(message, {
    action: {
      label: "Undo",
      onClick: async () => {
        if (!(await undo()).ok) toast.error("Couldn't undo");
        refetch();
      },
    },
  });
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
  const res = await patch(row.id, { start, end: new Date(+start + length), allDay: event.allDay });
  if (!res.ok) return revert();
  if (row.repeatDays) refetch();
  offerUndo("Moved", () => patch(row.id, { start: row.start, end: row.end, allDay: row.allDay }), refetch);
}

export function CalendarView({ todos }: { todos: CalendarTodo[] }) {
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

  const pending = todos.filter((t) => t.status === "todo");
  const groups = Object.entries(
    Object.groupBy(pending, (t) => t.projectName ?? "Personal"),
  );

  return (
    <div className="flex gap-6">
      <div ref={panelRef} className="flex w-56 shrink-0 flex-col gap-4">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
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
            fetch(`/api/events?${new URLSearchParams({ start: info.startStr, end: info.endStr })}`)
              .then((r) => r.json())
              .then((rows: EventRow[]) => success(rows.flatMap((row) => toInputs(row, info.start, info.end))))
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
              skipDates: [],
              ...EMPTY_SESSION,
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
              skipDates: row.skipDates?.split(",") ?? [],
              todoId: row.todoId,
              day: event.extendedProps.day,
              todoIds: row.todoIds?.split(",").map(Number) ?? [],
              goal: row.goal ?? "",
              startedAt: row.startedAt ? new Date(row.startedAt) : null,
              stoppedAt: row.stoppedAt ? new Date(row.stoppedAt) : null,
              goalAchieved: row.goalAchieved,
              focus: row.focus,
              energy: row.energy,
              interruptions: row.interruptions,
              music: row.music,
              location: row.location ?? "",
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
          key={`${draft.id ?? +draft.start}-${draft.day}`}
          draft={draft}
          todos={todos}
          onClose={() => {
            setDraft(null);
            refetch(); // the timer and +1 save without Save
          }}
          onSaved={(undo) => {
            setDraft(null);
            refetch();
            if (undo) offerUndo(undo.message, undo.run, refetch);
          }}
        />
      )}
    </div>
  );
}
