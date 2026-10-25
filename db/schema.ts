import { sqliteTable, integer, real, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { getTableColumns, relations, sql } from "drizzle-orm";

export const projectGroups = sqliteTable("project_groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").references(() => projectGroups.id, { onDelete: "set null" }),
  order: integer("order").notNull().default(0),
  name: text("name").notNull(),
  githubOwner: text("github_owner"),
  githubRepo: text("github_repo"),
  githubToken: text("github_token"),
  accentColor: text("accent_color"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// every project column except the token, for anything that reaches the browser
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { githubToken: _githubToken, ...publicProjectColumns } = getTableColumns(projects);
export { publicProjectColumns };

export const todos = sqliteTable(
  "todos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    labels: text("labels"),
    status: text("status", { enum: ["todo", "done"] }).notNull().default("todo"),
    source: text("source", { enum: ["manual", "github"] }).notNull().default("manual"),
    githubIssueNumber: integer("github_issue_number"),
    githubIssueUrl: text("github_issue_url"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    githubUnique: uniqueIndex("todos_project_issue_unique").on(t.projectId, t.githubIssueNumber),
  }),
);

export const ideas = sqliteTable("ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  notes: text("notes"),
  kind: text("kind", { enum: ["block", "plan", "note", "deep", "sleep"] }).notNull().default("block"),
  start: integer("start", { mode: "timestamp" }).notNull(),
  end: integer("end", { mode: "timestamp" }).notNull(),
  allDay: integer("all_day", { mode: "boolean" }).notNull().default(false),
  // weekdays the event repeats on, "0,1,...,6" with 0 = Sunday; null = one-off
  repeatDays: text("repeat_days"),
  // local days ("YYYY-MM-DD") removed from the series, comma-separated
  skipDates: text("skip_dates"),
  todoId: integer("todo_id").references(() => todos.id, { onDelete: "cascade" }),
  // deep work session; a deep block is one-off, so one row is one session
  // todos worked on, "3,7,12"
  todoIds: text("todo_ids"),
  goal: text("goal"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  stoppedAt: integer("stopped_at", { mode: "timestamp" }),
  goalAchieved: text("goal_achieved", { enum: ["yes", "partial", "no"] }),
  focus: integer("focus"),
  energy: integer("energy"),
  interruptions: integer("interruptions").notNull().default(0),
  music: text("music", { enum: ["none", "instrumental", "lyrics", "ambient"] }),
  location: text("location"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// logged once per local day ("YYYY-MM-DD")
export const dayLogs = sqliteTable("day_logs", {
  day: text("day").primaryKey(),
  // manual override; null = computed from sleep blocks
  sleepHours: real("sleep_hours"),
  exercise: integer("exercise", { mode: "boolean" }),
  caffeine: text("caffeine"),
  meetings: text("meetings"),
});

export const personalLabels = sqliteTable("personal_labels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const projectLabels = sqliteTable(
  "project_labels",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    projectNameUnique: uniqueIndex("project_labels_project_name_unique").on(t.projectId, t.name),
  }),
);

export const projectsRelations = relations(projects, ({ many }) => ({
  todos: many(todos),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  project: one(projects, { fields: [todos.projectId], references: [projects.id] }),
}));
