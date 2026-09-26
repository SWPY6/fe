CREATE TABLE `agentation_annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`timestamp` integer NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`session_id`) REFERENCES `agentation_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agentation_annotations_session_timestamp` ON `agentation_annotations` (`session_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `agentation_annotations_status` ON `agentation_annotations` (`status`);--> statement-breakpoint
CREATE TABLE `agentation_events` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`timestamp` text NOT NULL,
	`session_id` text NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `agentation_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agentation_events_session_sequence` ON `agentation_events` (`session_id`,`sequence`);--> statement-breakpoint
CREATE TABLE `agentation_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`url_key` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`project_id` text,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agentation_sessions_url_key` ON `agentation_sessions` (`url_key`);