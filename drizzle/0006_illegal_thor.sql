CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`kind` text DEFAULT 'block' NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`all_day` integer DEFAULT false NOT NULL,
	`todo_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`todo_id`) REFERENCES `todos`(`id`) ON UPDATE no action ON DELETE cascade
);
