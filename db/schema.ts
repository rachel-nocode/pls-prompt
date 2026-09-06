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
  accessMode: text("access_mode").notNull().default("free"),
  version: integer("version").notNull().default(1),
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
  position: integer("position").notNull().default(0),
  prerequisiteId: text("prerequisite_id"),
  rewardPromptId: text("reward_prompt_id"),
  checkData: text("check_data").notNull().default("{}"),
  version: integer("version").notNull().default(1),
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

export const contentRevisions = sqliteTable("content_revisions", {
  id: text("id").primaryKey(),
  appliedAt: text("applied_at").notNull(),
});

export const libraryItems = sqliteTable("library_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: text("prompt_id"),
  title: text("title").notNull(),
  promptText: text("prompt_text").notNull(),
  sourceUrl: text("source_url"),
  tags: text("tags").notNull().default("[]"),
  notes: text("notes").notNull().default(""),
  source: text("source").notNull().default("personal"),
  recipeSnapshot: text("recipe_snapshot"),
  sourceRecipeVersion: text("source_recipe_version"),
  version: integer("version").notNull().default(1),
  archivedAt: text("archived_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_library_user_prompt").on(table.userId, table.promptId),
  index("idx_library_user_updated").on(table.userId, table.updatedAt),
]);

export const libraryVersions = sqliteTable("library_versions", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull().references(() => libraryItems.id),
  userId: text("user_id").notNull(),
  version: integer("version").notNull(),
  snapshot: text("snapshot").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_library_version").on(table.itemId, table.version)]);

export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_collections_user").on(table.userId)]);

export const collectionItems = sqliteTable("collection_items", {
  id: text("id").primaryKey(),
  collectionId: text("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => libraryItems.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("idx_collection_item").on(table.collectionId, table.itemId)]);

export const lessonCompletions = sqliteTable("lesson_completions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  lessonVersion: integer("lesson_version").notNull(),
  rewardPromptId: text("reward_prompt_id"),
  completedAt: text("completed_at").notNull(),
}, (table) => [uniqueIndex("idx_completion_user_lesson").on(table.userId, table.lessonId)]);

export const promptAccess = sqliteTable("prompt_access", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: text("prompt_id").notNull(),
  source: text("source").notNull(),
  sourceId: text("source_id").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_access_source").on(table.userId, table.promptId, table.source, table.sourceId)]);

export const editorialVersions = sqliteTable("editorial_versions", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  recordId: text("record_id").notNull(),
  version: integer("version").notNull(),
  snapshot: text("snapshot").notNull(),
  editorId: text("editor_id").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_editorial_version").on(table.kind, table.recordId, table.version)]);

export const recipeProjects = sqliteTable("recipe_projects", {
  promptId: text("prompt_id").primaryKey().references(() => prompts.id),
  draft: text("draft").notNull(),
  revision: integer("revision").notNull().default(1),
  publishedVersionId: text("published_version_id"),
  showcase: integer("showcase").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

export const recipeVersions = sqliteTable("recipe_versions", {
  id: text("id").primaryKey(),
  promptId: text("prompt_id").notNull().references(() => prompts.id),
  version: integer("version").notNull(),
  payload: text("payload").notNull(),
  editorId: text("editor_id").notNull(),
  createdAt: text("created_at").notNull(),
}, table => [uniqueIndex("idx_recipe_prompt_version").on(table.promptId, table.version)]);

export const recipeDownloadCounts = sqliteTable("recipe_download_counts", {
  day: text("day").notNull(),
  promptId: text("prompt_id").notNull(),
  versionId: text("version_id").notNull(),
  downloads: integer("downloads").notNull().default(0),
}, table => [uniqueIndex("idx_recipe_download_day_version").on(table.day, table.promptId, table.versionId)]);
