CREATE TABLE `recipe_projects` (
	`prompt_id` text PRIMARY KEY NOT NULL,
	`draft` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_version_id` text,
	`showcase` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipe_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt_id` text NOT NULL,
	`version` integer NOT NULL,
	`payload` text NOT NULL,
	`editor_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_recipe_prompt_version` ON `recipe_versions` (`prompt_id`,`version`);--> statement-breakpoint
ALTER TABLE `library_items` ADD `recipe_snapshot` text;--> statement-breakpoint
ALTER TABLE `library_items` ADD `source_recipe_version` text;