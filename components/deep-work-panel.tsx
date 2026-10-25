"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@mimird/ui/components/button";
import { Input } from "@mimird/ui/components/input";
import { MenuSelect } from "@mimird/ui/components/menu-select";
import { SearchSelect } from "@mimird/ui/components/search-select";
import { Switch } from "@mimird/ui/components/switch";
import { TodoCheckbox } from "@/components/todo-checkbox";
import { PROJECT_ACCENTS } from "@/lib/project-accents";
import { dayKey, sleepHoursFor } from "@/lib/repeat-days";
import type { EventDraft } from "@/components/event-dialog";

export type CalendarTodo = {
  id: number;
  title: string;
  status: "todo" | "done";
  projectName: string | null;
  accentColor: string | null;
};

type DayLog = { sleepHours: number | null; exercise: boolean | null; caffeine: string | null; meetings: string | null };

const MUSIC = [
  { value: "", label: "Music?" },
  { value: "none", label: "No music" },
  { value: "instrumental", label: "Instrumental" },
  { value: "lyrics", label: "With lyrics" },
  { value: "ambient", label: "Ambient" },
];

const ACHIEVED = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "No" },
] as const;

// a pressed toggle carries the accent instead of a fill
const PRESSED = "aria-pressed:border-brand aria-pressed:text-brand";

const minutes = (ms: number) => `${Math.floor(ms / 6e4)}m`;

// a row of toggle buttons; clicking the pressed one clears it
function Toggles<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      <span className="mr-2 w-28 text-sm text-muted-foreground">{label}</span>
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          variant="outline"
          size={typeof o.value === "number" ? "icon" : "default"}
          className={PRESSED}
          aria-pressed={value === o.value}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

const SCALE = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }));

export function DeepWorkPanel({
  form,
  update,
  todos,
}: {
  form: EventDraft;
  update: (fields: Partial<EventDraft>) => void;
  todos: CalendarTodo[];
}) {
  const [now, setNow] = useState(() => Date.now());
  const running = !!form.startedAt && !form.stoppedAt;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  // timer and interruptions save straight away, so a reload mid-session loses nothing
  async function live(fields: Partial<EventDraft>) {
    const res = await fetch(`/api/events/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (res.ok) update(fields);
  }

  const attached = form.todoIds.map((id) => todos.find((t) => t.id === id)).filter((t) => !!t);
  const projects = [...new Map(attached.map((t) => [t.projectName ?? "Personal", t.accentColor])).entries()];
  const planned = +form.end - +form.start;
  const elapsed = form.startedAt ? +(form.stoppedAt ?? now) - +form.startedAt : 0;

  return (
    <div className="flex flex-col gap-3">
      <SearchSelect
        items={todos.filter((t) => t.status === "todo" || form.todoIds.includes(t.id))}
        value={attached}
        onValueChange={(picked) => update({ todoIds: picked.map((t) => t.id) })}
        itemLabel={(t) => t.title}
        itemDescription={(t) => t.projectName ?? "Personal"}
        placeholder="Add todos to work on"
        aria-label="Todos"
      />
      {attached.length > 0 && (
        <div className="flex flex-col gap-1">
          {attached.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <TodoCheckbox id={t.id} done={t.status === "done"} />
              <span className={t.status === "done" ? "line-through opacity-70" : ""}>{t.title}</span>
            </label>
          ))}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {projects.map(([name, accent]) => (
              <span key={name} className="flex items-center gap-1">
                <span
                  className="size-2 rounded-full bg-muted-foreground"
                  style={{ backgroundColor: PROJECT_ACCENTS.find((a) => a.key === accent)?.hex }}
                />
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <Input value={form.goal} onChange={(e) => update({ goal: e.target.value })} placeholder="Goal for this session" />
      <Toggles label="Energy before" options={SCALE} value={form.energy} onChange={(energy) => update({ energy })} />
      <div className="flex items-center gap-3">
        <MenuSelect
          value={form.music ?? ""}
          onValueChange={(v) => update({ music: (v || null) as EventDraft["music"] })}
          options={MUSIC}
          className="w-36"
          aria-label="Music"
        />
        <Input value={form.location} onChange={(e) => update({ location: e.target.value })} placeholder="Location" />
      </div>

      {form.id ? (
        <div className="flex items-center gap-2 rounded-md p-2 ring-1 ring-foreground/10">
          {!form.startedAt && (
            <Button type="button" onClick={() => live({ startedAt: new Date() })}>
              Start
            </Button>
          )}
          {running && (
            <Button type="button" onClick={() => live({ stoppedAt: new Date() })}>
              Stop
            </Button>
          )}
          <span className="text-sm tabular-nums" aria-live="polite">
            {minutes(elapsed)} <span className="text-muted-foreground">/ planned {minutes(planned)}</span>
          </span>
          <Button
            type="button"
            variant="outline"
            className="ml-auto"
            onClick={() => live({ interruptions: form.interruptions + 1 })}
          >
            +1 interruption
          </Button>
          <span className="w-6 text-sm tabular-nums" aria-label="Interruptions">
            {form.interruptions}
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Create the block to start the timer.</p>
      )}

      {form.stoppedAt && (
        <>
          <Toggles
            label="Goal achieved"
            options={ACHIEVED}
            value={form.goalAchieved}
            onChange={(goalAchieved) => update({ goalAchieved })}
          />
          <Toggles label="Focus" options={SCALE} value={form.focus} onChange={(focus) => update({ focus })} />
        </>
      )}

      <DayLogSection day={dayKey(form.start)} />
    </div>
  );
}

// once-per-day context, shared by every session that day; saves on its own
function DayLogSection({ day }: { day: string }) {
  const [log, setLog] = useState<DayLog | null>(null);
  const [computedSleep, setComputedSleep] = useState(0);

  useEffect(() => {
    fetch(`/api/day-logs/${day}`).then((r) => r.json()).then(setLog);
    // computed here, not on the server: repeating blocks expand in the browser's timezone
    const [y, m, d] = day.split("-").map(Number);
    const range = { start: new Date(y, m - 1, d).toISOString(), end: new Date(y, m - 1, d + 1).toISOString() };
    fetch(`/api/events?${new URLSearchParams(range)}`)
      .then((r) => r.json())
      .then((rows) => setComputedSleep(sleepHoursFor(day, rows.filter((r: { kind: string }) => r.kind === "sleep"))));
  }, [day]);

  function save(next: DayLog) {
    setLog(next);
    fetch(`/api/day-logs/${day}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  return (
    <details className="group/day">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 -rotate-90 transition-transform group-open/day:rotate-0" aria-hidden />
        Today ({day})
      </summary>
      {log && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              Sleep (h)
              <Input
                type="number"
                min={0}
                max={24}
                step={0.25}
                className="w-24"
                defaultValue={log.sleepHours ?? ""}
                placeholder={computedSleep ? computedSleep.toFixed(2).replace(/\.?0+$/, "") : "—"}
                onBlur={(e) => save({ ...log, sleepHours: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!log.exercise} onChange={(e) => save({ ...log, exercise: e.target.checked })} />
              Exercise
            </label>
          </div>
          <Input
            defaultValue={log.caffeine ?? ""}
            placeholder="Caffeine (e.g. 2 cups, last 14:00)"
            onBlur={(e) => save({ ...log, caffeine: e.target.value })}
          />
          <Input
            defaultValue={log.meetings ?? ""}
            placeholder="Meetings or obligations"
            onBlur={(e) => save({ ...log, meetings: e.target.value })}
          />
        </div>
      )}
    </details>
  );
}
