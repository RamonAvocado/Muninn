CREATE TABLE `day_logs` (
	`day` text PRIMARY KEY NOT NULL,
	`sleep_hours` real,
	`exercise` integer,
	`caffeine` text,
	`meetings` text
);
--> statement-breakpoint
ALTER TABLE `events` ADD `todo_ids` text;--> statement-breakpoint
ALTER TABLE `events` ADD `goal` text;--> statement-breakpoint
ALTER TABLE `events` ADD `started_at` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `stopped_at` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `goal_achieved` text;--> statement-breakpoint
ALTER TABLE `events` ADD `focus` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `energy` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `interruptions` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `music` text;--> statement-breakpoint
ALTER TABLE `events` ADD `location` text;