import { env } from "cloudflare:workers";
import { seedLessons, seedPrompts, type LessonRecord, type PromptRecord } from "./content";

type DatabaseResult<T> = { results?: T[] };

function db() {
  const binding = (env as unknown as { DB?: D1Database }).DB;
  if (!binding) throw new Error("Prompt database is unavailable.");
  return binding;
}

function parseRows<T>(result: DatabaseResult<T>): T[] {
  return result.results ?? [];
}

let seedPromise: Promise<void> | null = null;

async function prepareDatabase() {
  const database = db();

  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      promise TEXT NOT NULL,
      prompt_text TEXT,
      github_url TEXT,
      asset_key TEXT,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      difficulty TEXT NOT NULL DEFAULT 'beginner',
      models TEXT NOT NULL DEFAULT '[]',
      anatomy TEXT NOT NULL DEFAULT '[]',
      example_output TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      quality_score INTEGER NOT NULL DEFAULT 0,
      author_id TEXT NOT NULL DEFAULT 'plsprompt-team',
      author_name TEXT NOT NULL DEFAULT 'PlsPrompt Team',
      status TEXT NOT NULL DEFAULT 'draft',
      tested_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      eyebrow TEXT NOT NULL,
      summary TEXT NOT NULL,
      body TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'beginner',
      minutes INTEGER NOT NULL DEFAULT 5,
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS prompt_saves (
      id TEXT PRIMARY KEY NOT NULL,
      prompt_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_prompts_status_quality ON prompts (status, verified, quality_score, created_at)"),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_prompts_author ON prompts (author_id, created_at)"),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons (published, created_at)"),
  ]);

  const count = await database.prepare("SELECT COUNT(*) AS count FROM prompts").first<{ count: number }>();
  if ((count?.count ?? 0) > 0) return;

  const promptStatements = seedPrompts.map((prompt) =>
    database
      .prepare(`INSERT OR IGNORE INTO prompts (
        id, slug, title, promise, prompt_text, github_url, asset_key, category, tags,
        difficulty, models, anatomy, example_output, verified, quality_score,
        author_id, author_name, status, tested_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        prompt.id, prompt.slug, prompt.title, prompt.promise, prompt.prompt_text,
        prompt.github_url, prompt.asset_key, prompt.category, prompt.tags,
        prompt.difficulty, prompt.models, prompt.anatomy, prompt.example_output,
        prompt.verified, prompt.quality_score, prompt.author_id, prompt.author_name,
        prompt.status, prompt.tested_at, prompt.created_at, prompt.updated_at,
      ),
  );
  const lessonStatements = seedLessons.map((lesson) =>
    database
      .prepare(`INSERT OR IGNORE INTO lessons (
        id, slug, title, eyebrow, summary, body, level, minutes, published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        lesson.id, lesson.slug, lesson.title, lesson.eyebrow, lesson.summary,
        lesson.body, lesson.level, lesson.minutes, lesson.published,
        lesson.created_at, lesson.updated_at,
      ),
  );
  await database.batch([...promptStatements, ...lessonStatements]);
}

export async function ensureSeeded() {
  seedPromise ??= prepareDatabase().catch((error) => {
    seedPromise = null;
    throw error;
  });
  await seedPromise;
}

export async function getPublishedPrompts(): Promise<PromptRecord[]> {
  await ensureSeeded();
  const result = await db()
    .prepare("SELECT * FROM prompts WHERE status = ? ORDER BY verified DESC, quality_score DESC, created_at DESC")
    .bind("published")
    .all<PromptRecord>();
  return parseRows(result);
}

export async function getPromptBySlug(slug: string): Promise<PromptRecord | null> {
  await ensureSeeded();
  return db().prepare("SELECT * FROM prompts WHERE slug = ? AND status = ? LIMIT 1")
    .bind(slug, "published").first<PromptRecord>();
}

export async function getPublishedLessons(): Promise<LessonRecord[]> {
  await ensureSeeded();
  const result = await db().prepare("SELECT * FROM lessons WHERE published = ? ORDER BY created_at ASC")
    .bind(1).all<LessonRecord>();
  return parseRows(result);
}

export async function getLessonBySlug(slug: string): Promise<LessonRecord | null> {
  await ensureSeeded();
  return db().prepare("SELECT * FROM lessons WHERE slug = ? AND published = ? LIMIT 1")
    .bind(slug, 1).first<LessonRecord>();
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
