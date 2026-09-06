import content from "./daily-project-content.json" with { type: "json" };
import type { SqlDatabase } from "./repository";
import { recipeSchema, publicationProblems } from "./recipe-types.ts";
import { recipeText } from "./recipe-export.ts";

export async function seedDailyProjects(database: SqlDatabase) {
  for (const entry of content) {
    const revision = `daily-project-${entry.releaseDay}-${entry.slug}-v1`;
    if (await database.prepare("SELECT id FROM content_revisions WHERE id=?").bind(revision).first()) continue;
    const recipe = recipeSchema.parse(entry.recipe);
    if (publicationProblems(recipe).length) throw new Error("Daily recipe has incomplete proof: " + entry.slug);
    const payload = JSON.stringify(recipe), versionId = entry.id + "-v1", time = new Date().toISOString();
    const guard = " NOT EXISTS(SELECT 1 FROM content_revisions WHERE id=?)";
    await database.batch([
      database.prepare("INSERT INTO prompts(id,slug,title,promise,prompt_text,category,tags,author_id,author_name,status,access_mode,version,created_at,updated_at) SELECT ?,?,?,?,?,?,?,'plsprompt-team','PLS PROMPT','published','free',1,?,? WHERE" + guard).bind(entry.id,entry.slug,recipe.title,recipe.summary,recipeText(recipe),recipe.category,JSON.stringify(recipe.tags),time,time,revision),
      database.prepare("INSERT INTO recipe_versions(id,prompt_id,version,payload,editor_id,created_at) SELECT ?,?,1,?,'plsprompt-team',? WHERE" + guard).bind(versionId,entry.id,payload,time,revision),
      database.prepare("INSERT INTO recipe_projects(prompt_id,draft,revision,published_version_id,showcase,updated_at) SELECT ?,?,1,?,1,? WHERE" + guard).bind(entry.id,payload,versionId,time,revision),
      database.prepare("INSERT OR IGNORE INTO content_revisions(id,applied_at) VALUES (?,?)").bind(revision,time),
    ]);
  }
}
