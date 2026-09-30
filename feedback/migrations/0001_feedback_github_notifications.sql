CREATE TABLE `feedback_github_notifications` (
	`annotation_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`issue_number` integer,
	`issue_url` text,
	`error` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`annotation_id`) REFERENCES `agentation_annotations`(`id`) ON UPDATE no action ON DELETE cascade
);
