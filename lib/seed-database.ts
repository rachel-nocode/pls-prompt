import type { SqlDatabase } from "./repository";
import { seedLessons, seedPrompts } from "./content.ts";
import { beginnerLessons, projectRecipes } from "./recipe-content.ts";

export async function seedDatabase(database: SqlDatabase) {

  const count = await database.prepare("SELECT COUNT(*) AS count FROM prompts").first<{ count: number }>();
  const needsLegacySeed = (count?.count ?? 0) === 0;

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
  if (needsLegacySeed) await database.batch([...promptStatements, ...lessonStatements]);
  const revision = "phase-1-beginner-recipes-v1";
  if (await database.prepare("SELECT id FROM content_revisions WHERE id=?").bind(revision).first()) return;
  const time = new Date().toISOString();
  const guard = " NOT EXISTS(SELECT 1 FROM content_revisions WHERE id=?)";
  const statements = [];
  for (const lesson of seedLessons) {
    statements.push(database.prepare(`INSERT OR IGNORE INTO lessons(id,slug,title,eyebrow,summary,body,level,minutes,published,created_at,updated_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE` + guard).bind(lesson.id,lesson.slug,lesson.title,lesson.eyebrow,lesson.summary,lesson.body,lesson.level,lesson.minutes,lesson.published,lesson.created_at,lesson.updated_at,revision));
  }
  for (const recipe of projectRecipes) {
    statements.push(database.prepare(`INSERT OR IGNORE INTO prompts(id,slug,title,promise,prompt_text,category,tags,difficulty,models,anatomy,example_output,author_id,author_name,status,access_mode,created_at,updated_at)
      SELECT ?,?,?,?,?,'Projects',?,'Project recipe',?,'[]',?,'plsprompt-team','PlsPrompt Team','published','earned',?,? WHERE` + guard).bind(recipe.id,recipe.slug,recipe.title,recipe.promise,recipe.text,JSON.stringify(["project recipe","copy ready"]),JSON.stringify(["Codex","Claude Code","AI app builders"]),recipe.promise,time,time,revision));
  }
  for (const [index, lesson] of beginnerLessons.entries()) {
    statements.push(database.prepare("UPDATE lessons SET title=?,summary=?,body=?,minutes=?,level='Beginner',position=?,prerequisite_id=?,reward_prompt_id=?,check_data=?,version=version+1,updated_at=? WHERE id=? AND" + guard).bind(lesson.title,lesson.summary,lesson.body,lesson.minutes,index+1,lesson.prerequisite,lesson.reward,JSON.stringify(lesson.check),time,lesson.id,revision));
  }
  statements.push(database.prepare(`INSERT OR IGNORE INTO library_items(id,user_id,prompt_id,title,prompt_text,source_url,tags,source,created_at,updated_at)
    SELECT 'legacy-' || s.id,s.user_id,p.id,p.title,COALESCE(p.prompt_text,''),COALESCE(p.github_url,CASE WHEN p.asset_key IS NOT NULL THEN '/assets/' || p.asset_key END),p.tags,'saved',s.created_at,s.created_at
    FROM prompt_saves s JOIN prompts p ON p.id=s.prompt_id WHERE` + guard + " ORDER BY s.created_at,s.id").bind(revision));
  statements.push(database.prepare("INSERT OR IGNORE INTO content_revisions(id,applied_at) VALUES (?,?)").bind(revision,time));
  await database.batch(statements);
}
