DROP INDEX `lessons_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lessons_slug` ON `lessons` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_lessons_published` ON `lessons` (`published`,`created_at`);--> statement-breakpoint
DROP INDEX `prompts_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_prompts_slug` ON `prompts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_prompts_status_quality` ON `prompts` (`status`,`verified`,`quality_score`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_prompts_author` ON `prompts` (`author_id`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
