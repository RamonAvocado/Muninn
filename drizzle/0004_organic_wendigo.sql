CREATE TABLE `project_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_project_labels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_project_labels`("id", "project_id", "name", "color", "created_at") SELECT "id", "project_id", "name", "color", "created_at" FROM `project_labels`;--> statement-breakpoint
DROP TABLE `project_labels`;--> statement-breakpoint
ALTER TABLE `__new_project_labels` RENAME TO `project_labels`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `project_labels_project_name_unique` ON `project_labels` (`project_id`,`name`);--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text,
	`order` integer DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`github_owner` text,
	`github_repo` text,
	`accent_color` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `project_groups`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "group_id", "order", "name", "github_owner", "github_repo", "accent_color", "created_at") SELECT "id", NULL, 0, "name", "github_owner", "github_repo", "accent_color", "created_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
CREATE TABLE `__new_todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text,
	`title` text NOT NULL,
	`description` text,
	`labels` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`github_issue_number` integer,
	`github_issue_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_todos`("id", "project_id", "title", "description", "labels", "status", "source", "github_issue_number", "github_issue_url", "created_at", "updated_at") SELECT "id", "project_id", "title", "description", "labels", "status", "source", "github_issue_number", "github_issue_url", "created_at", "updated_at" FROM `todos`;--> statement-breakpoint
DROP TABLE `todos`;--> statement-breakpoint
ALTER TABLE `__new_todos` RENAME TO `todos`;--> statement-breakpoint
CREATE UNIQUE INDEX `todos_project_issue_unique` ON `todos` (`project_id`,`github_issue_number`);