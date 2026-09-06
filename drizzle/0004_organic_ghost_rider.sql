CREATE TABLE `recipe_download_counts` (
	`day` text NOT NULL,
	`prompt_id` text NOT NULL,
	`version_id` text NOT NULL,
	`downloads` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_recipe_download_day_version` ON `recipe_download_counts` (`day`,`prompt_id`,`version_id`);