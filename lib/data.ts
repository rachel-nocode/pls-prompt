import { env } from "cloudflare:workers";
import { createRepository, type SqlDatabase } from "./repository";
import { seedDatabase } from "./seed-database";
import { seedGallery } from "./seed-gallery";
import { seedDailyProjects } from "./seed-daily-projects";
import { seedEditorialRelease } from "./seed-editorial-release";

export function db() {
  const binding = (env as unknown as { DB?: D1Database }).DB;
  if (!binding) throw new Error("Prompt database is unavailable.");
  return binding;
}

let seedPromise: Promise<void> | null = null;


export async function ensureSeeded() {
  seedPromise ??= seedDatabase(db()).then(() => seedGallery(db())).then(() => seedDailyProjects(db())).then(() => seedEditorialRelease(db())).catch((error) => {
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
  return (await (await repository()).listPrompts()).filter(prompt => prompt.access_mode === "free");
}

export async function getPromptBySlug(slug: string) {
  return (await repository()).promptBySlug(slug, null);
}

export async function getPublishedLessons() {
  return (await repository()).publicLessons();
}

export async function getLessonBySlug(slug: string) {
  return (await getPublishedLessons()).find(lesson => lesson.slug === slug) ?? null;
}
