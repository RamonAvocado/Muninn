"use client";

import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Input } from "@mimird/ui/components/input";
import { Textarea } from "@mimird/ui/components/textarea";
import { Modal } from "@mimird/ui/components/modal";
import { MenuSelect } from "@mimird/ui/components/menu-select";
import { Switch } from "@mimird/ui/components/switch";
import { DeepWorkPanel, type CalendarTodo } from "@/components/deep-work-panel";

export type EventDraft = {
  id?: number;
  title: string;
  notes: string;
  kind: "block" | "plan" | "note" | "deep" | "sleep";
  start: Date;
  end: Date;
  allDay: boolean;
  repeatDays: number[];
  skipDates: string[];
  todoId?: number | null;
  /** the clicked occurrence of a repeating entry, "YYYY-MM-DD" */
  day?: string;
  // deep work session
  todoIds: number[];
  goal: string;
  startedAt: Date | null;
  stoppedAt: Date | null;
  goalAchieved: "yes" | "partial" | "no" | null;
  focus: number | null;
  energy: number | null;
  interruptions: number;
  music: "none" | "instrumental" | "lyrics" | "ambient" | null;
  location: string;
};

export const EMPTY_SESSION = {
  todoIds: [],
  goal: "",
  startedAt: null,
  stoppedAt: null,
  goalAchieved: null,
  focus: null,
  energy: null,
  interruptions: 0,
  music: null,
  location: "",
} satisfies Partial<EventDraft>;

const KINDS = [
  { value: "block", label: "Time block" },
  { value: "plan", label: "Plan" },
  { value: "note", label: "Note" },
  { value: "deep", label: "Deep work" },
  { value: "sleep", label: "Sleep" },
];

// the draft as the events API takes it
const toBody = (d: EventDraft) => ({
  ...d,
  repeatDays: d.repeatDays.join(","),
  skipDates: d.skipDates.join(","),
  todoIds: d.todoIds.join(","),
});

// Monday-first, matching the calendar; value is JS getDay()
const WEEKDAYS = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];

// a pressed toggle carries the accent instead of a fill
const PRESSED = "aria-pressed:border-brand aria-pressed:text-brand";

export function EventDialog({
  draft,
  onClose,
  onSaved,
  todos,
}: {
  draft: EventDraft;
  todos: CalendarTodo[];
  onClose: () => void;
  /** with an undo, the calendar offers it in a toast */
  onSaved: (undo?: { message: string; run: () => Promise<Response> }) => void;
}) {
  const [form, setForm] = useState(draft);
  const [pending, setPending] = useState(false);
  const everyDay = form.repeatDays.length === 7;

  const isSeries = !!draft.id && draft.repeatDays.length > 0;

  const request = (method: "POST" | "PATCH" | "DELETE", url: string, body?: object) =>
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });

  async function send(method: "POST" | "PATCH" | "DELETE", body?: object, undo?: Parameters<typeof onSaved>[0]) {
    setPending(true);
    const res = await request(method, draft.id ? `/api/events/${draft.id}` : "/api/events", body);
    setPending(false);
    if (res.ok) onSaved(undo);
  }

  // undoing a delete recreates the entry as it was when the dialog opened (it gets a new id)
  const restore = () => request("POST", "/api/events", toBody(draft));

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={draft.id ? "Edit entry" : "New entry"}>
        <h2 className="font-heading text-base font-medium">{draft.id ? "Edit entry" : "New entry"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.title.trim()) send(draft.id ? "PATCH" : "POST", toBody(form));
          }}
          className="flex flex-col gap-3"
        >
          <Input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
          />
          <div className="flex items-center gap-3">
            <MenuSelect
              value={form.kind}
              onValueChange={(v) => setForm({ ...form, kind: v as EventDraft["kind"] })}
              options={KINDS}
              className="w-36"
              aria-label="Kind"
            />
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} />
              All day
            </label>
          </div>
          {form.kind === "deep" && (
            <DeepWorkPanel form={form} update={(fields) => setForm((f) => ({ ...f, ...fields }))} todos={todos} />
          )}
          {/* deep work is one-off: one block is one session */}
          {form.kind !== "deep" && <div className="flex items-center gap-1">
            <span className="mr-2 text-sm text-muted-foreground">Repeat</span>
            <Button
              type="button"
              variant="outline"
              aria-pressed={everyDay}
              className={PRESSED}
              onClick={() => setForm({ ...form, repeatDays: everyDay ? [] : WEEKDAYS.map((w) => w.day) })}
            >
              Every day
            </Button>
            {WEEKDAYS.map(({ day, name }) => {
              const on = form.repeatDays.includes(day);
              return (
                <Button
                  key={day}
                  type="button"
                  size="icon"
                  variant="outline"
                  className={PRESSED}
                  title={name}
                  aria-label={name}
                  aria-pressed={on}
                  onClick={() =>
                    setForm({
                      ...form,
                      repeatDays: on ? form.repeatDays.filter((d) => d !== day) : [...form.repeatDays, day],
                    })
                  }
                >
                  {name[0]}
                </Button>
              );
            })}
          </div>}
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
          />
          <div className="flex justify-end gap-2">
            {isSeries && draft.day && (
              // removes only the clicked day; the rest of the series stays
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  send(
                    "PATCH",
                    { skipDates: [...draft.skipDates, draft.day].join(",") },
                    {
                      message: "Day removed",
                      run: () => request("PATCH", `/api/events/${draft.id}`, { skipDates: draft.skipDates.join(",") }),
                    },
                  )
                }
              >
                Delete this day
              </Button>
            )}
            {draft.id && (
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  send("DELETE", undefined, { message: isSeries ? "Series deleted" : "Entry deleted", run: restore })
                }
              >
                {isSeries ? "Delete all" : "Delete"}
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {draft.id ? "Save" : "Create"}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
