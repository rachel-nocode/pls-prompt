CREATE TABLE `collection_items` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`item_id` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `library_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_collection_item` ON `collection_items` (`collection_id`,`item_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_collections_user` ON `collections` (`user_id`);--> statement-breakpoint
CREATE TABLE `content_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`applied_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `editorial_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`record_id` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot` text NOT NULL,
	`editor_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_editorial_version` ON `editorial_versions` (`kind`,`record_id`,`version`);--> statement-breakpoint
CREATE TABLE `lesson_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`lesson_version` integer NOT NULL,
	`reward_prompt_id` text,
	`completed_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_completion_user_lesson` ON `lesson_completions` (`user_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `library_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt_id` text,
	`title` text NOT NULL,
	`prompt_text` text NOT NULL,
	`source_url` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'personal' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`archived_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_library_user_prompt` ON `library_items` (`user_id`,`prompt_id`);--> statement-breakpoint
CREATE INDEX `idx_library_user_updated` ON `library_items` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `library_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `library_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_library_version` ON `library_versions` (`item_id`,`version`);--> statement-breakpoint
CREATE TABLE `prompt_access` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt_id` text NOT NULL,
	`source` text NOT NULL,
	`source_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_access_source` ON `prompt_access` (`user_id`,`prompt_id`,`source`,`source_id`);--> statement-breakpoint
ALTER TABLE `lessons` ADD `position` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `prerequisite_id` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `reward_prompt_id` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `check_data` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `prompts` ADD `access_mode` text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `prompts` ADD `version` integer DEFAULT 1 NOT NULL;