import { todos } from "@/db/schema";

export interface GithubIssue {
  number: number;
  title: string;
  body?: string | null;
  labels?: (string | { name: string })[];
  state: "open" | "closed";
  html_url: string;
  updated_at: string;
  pull_request?: unknown;
}

export function toTodoRow(issue: GithubIssue, projectId: string): typeof todos.$inferInsert {
  return {
    projectId,
    title: issue.title,
    description: issue.body ?? null,
    labels: (issue.labels ?? []).map((l) => (typeof l === "string" ? l : l.name)).join(",") || null,
    status: issue.state === "closed" ? "done" : "todo",
    source: "github",
    githubIssueNumber: issue.number,
    githubIssueUrl: issue.html_url,
    updatedAt: new Date(issue.updated_at),
  };
}
