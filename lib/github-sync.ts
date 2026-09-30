import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { todos } from "@/db/schema";

// AES-256-GCM; stored as "iv:tag:ciphertext" (base64). Losing TOKEN_SECRET = re-enter tokens.
function tokenKey() {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) throw new Error("TOKEN_SECRET is not set");
  return createHash("sha256").update(secret).digest();
}

export function encryptToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const data = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(":");
}

export function decryptToken(stored: string) {
  const [iv, tag, data] = stored.split(":").map((s) => Buffer.from(s, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

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

export function githubHeaders(project: { githubToken: string | null }) {
  return {
    Authorization: `Bearer ${project.githubToken ? decryptToken(project.githubToken) : process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };
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
