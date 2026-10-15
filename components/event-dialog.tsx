"use client";

import { useState } from "react";
import { Button } from "@mimird/ui/components/button";
import { Input } from "@mimird/ui/components/input";
import { Textarea } from "@mimird/ui/components/textarea";
import { Modal } from "@mimird/ui/components/modal";
import { MenuSelect } from "@mimird/ui/components/menu-select";
import { Switch } from "@mimird/ui/components/switch";

export type EventDraft = {
  id?: number;
  title: string;
  notes: string;
  kind: "block" | "plan" | "note";
  start: Date;
  end: Date;
  allDay: boolean;
  repeatDays: number[];
};

const KINDS = [
  { value: "block", label: "Time block" },
  { value: "plan", label: "Plan" },
  { value: "note", label: "Note" },
];

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
}: {
  draft: EventDraft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(draft);
  const [pending, setPending] = useState(false);
  const everyDay = form.repeatDays.length === 7;

  async function send(method: "POST" | "PATCH" | "DELETE") {
    setPending(true);
    const res = await fetch(draft.id ? `/api/events/${draft.id}` : "/api/events", {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify({ ...form, repeatDays: form.repeatDays.join(",") }),
    });
    setPending(false);
    if (res.ok) onSaved();
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={draft.id ? "Edit entry" : "New entry"}>
        <h2 className="font-heading text-base font-medium">{draft.id ? "Edit entry" : "New entry"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.title.trim()) send(draft.id ? "PATCH" : "POST");
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
          <div className="flex items-center gap-1">
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
          </div>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
          />
          <div className="flex justify-end gap-2">
            {draft.id && (
              <Button type="button" variant="destructive" disabled={pending} onClick={() => send("DELETE")}>
                Delete
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
