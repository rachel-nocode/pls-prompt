import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const prompts = sqliteTable("prompts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  promise: text("promise").notNull(),
  promptText: text("prompt_text"),
  githubUrl: text("github_url"),
  assetKey: text("asset_key"),
  category: text("category").notNull(),
  tags: text("tags").notNull().default("[]"),
  difficulty: text("difficulty").notNull().default("beginner"),
  models: text("models").notNull().default("[]"),
  anatomy: text("anatomy").notNull().default("[]"),
  exampleOutput: text("example_output"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  qualityScore: integer("quality_score").notNull().default(0),
  authorId: text("author_id").notNull().default("plsprompt-team"),
  authorName: text("author_name").notNull().default("PlsPrompt Team"),
  status: text("status").notNull().default("draft"),
  testedAt: text("tested_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_prompts_slug").on(table.slug),
  index("idx_prompts_status_quality").on(table.status, table.verified, table.qualityScore, table.createdAt),
  index("idx_prompts_author").on(table.authorId, table.createdAt),
]);

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  eyebrow: text("eyebrow").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  level: text("level").notNull().default("beginner"),
  minutes: integer("minutes").notNull().default(5),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_lessons_slug").on(table.slug),
  index("idx_lessons_published").on(table.published, table.createdAt),
]);

export const promptSaves = sqliteTable("prompt_saves", {
  id: text("id").primaryKey(),
  promptId: text("prompt_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").notNull(),
});
