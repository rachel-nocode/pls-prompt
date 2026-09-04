CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`eyebrow` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL,
	`minutes` integer DEFAULT 5 NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_slug_unique` ON `lessons` (`slug`);--> statement-breakpoint
CREATE TABLE `prompt_saves` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`promise` text NOT NULL,
	`prompt_text` text,
	`github_url` text,
	`asset_key` text,
	`category` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`models` text DEFAULT '[]' NOT NULL,
	`anatomy` text DEFAULT '[]' NOT NULL,
	`example_output` text,
	`verified` integer DEFAULT false NOT NULL,
	`quality_score` integer DEFAULT 0 NOT NULL,
	`author_id` text DEFAULT 'plsprompt-team' NOT NULL,
	`author_name` text DEFAULT 'PlsPrompt Team' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`tested_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prompts_slug_unique` ON `prompts` (`slug`);