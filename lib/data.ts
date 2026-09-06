import { env } from "cloudflare:workers";
import { createRepository, type SqlDatabase } from "./repository";
import { seedDatabase } from "./seed-database";
import { seedGallery } from "./seed-gallery";
import type { Actor } from "./library-types";
import type { PromptRecord } from "./content";

type DatabaseResult<T> = { results?: T[] };

export function db() {
  const binding = (env as unknown as { DB?: D1Database }).DB;
  if (!binding) throw new Error("Prompt database is unavailable.");
  return binding;
}

function parseRows<T>(result: DatabaseResult<T>): T[] {
  return result.results ?? [];
}

let seedPromise: Promise<void> | null = null;


export async function ensureSeeded() {
  seedPromise ??= seedDatabase(db()).then(() => seedGallery(db())).catch((error) => {
    seedPromise = null;
    throw error;
  });
  await seedPromise;
}

export async function repository() {
  await ensureSeeded();
  return createRepository(db() as unknown as SqlDatabase);
}

export async function getPublishedPrompts() {
  return (await repository()).listPrompts();
}

export async function getPromptBySlug(slug: string, actor: Actor | null = null) {
  return (await repository()).promptBySlug(slug, actor);
}

export async function getPublishedLessons() {
  return (await repository()).publicLessons();
}

export async function getLessonBySlug(slug: string) {
  return (await getPublishedLessons()).find(lesson => lesson.slug === slug) ?? null;
}

export async function getPromptsByAuthor(authorId: string): Promise<PromptRecord[]> {
  await ensureSeeded();
  const result = await db().prepare("SELECT * FROM prompts WHERE author_id = ? ORDER BY created_at DESC")
    .bind(authorId).all<PromptRecord>();
  return parseRows(result);
}

export async function createPrompt(input: {
  title: string; promise: string; promptText: string | null; githubUrl: string | null;
  assetKey: string | null; category: string; models: string[]; authorId: string; authorName: string;
}) {
  await ensureSeeded();
  const database = db();
  const id = crypto.randomUUID();
  const slugBase = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "community-prompt";
  const slug = `${slugBase}-${id.slice(0, 6)}`;
  const now = new Date().toISOString();
  await database.prepare(`INSERT INTO prompts (
    id, slug, title, promise, prompt_text, github_url, asset_key, category, tags,
    difficulty, models, anatomy, example_output, verified, quality_score,
    author_id, author_name, status, tested_at, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      id, slug, input.title, input.promise, input.promptText, input.githubUrl,
      input.assetKey, input.category, "[]", "Unrated", JSON.stringify(input.models),
      "[]", null, 0, 0, input.authorId, input.authorName, "review", null, now, now,
    ).run();
  return { id, slug, status: "review" };
}
