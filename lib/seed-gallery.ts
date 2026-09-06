import content from "./gallery-content.json" with { type: "json" };
import type { SqlDatabase } from "./repository";
import { recipeSchema, publicationProblems } from "./recipe-types.ts";
import { recipeText } from "./recipe-export.ts";

export async function seedGallery(database: SqlDatabase) {
  const revision = "recipe-gallery-release-v1";
  if (await database.prepare("SELECT id FROM content_revisions WHERE id=?").bind(revision).first()) return;
  const guard = " NOT EXISTS(SELECT 1 FROM content_revisions WHERE id=?)";
  const statements = [];
  const seededAt = Date.now();
  for (const [index, entry] of content.entries()) {
    const recipe = recipeSchema.parse(entry.recipe);
    if (publicationProblems(recipe).length) throw new Error("Gallery recipe has incomplete proof: " + entry.slug);
    const payload = JSON.stringify(recipe), versionId = entry.id + "-v1", time = new Date(seededAt + index).toISOString();
    statements.push(database.prepare("INSERT OR IGNORE INTO prompts(id,slug,title,promise,prompt_text,category,tags,author_id,author_name,status,access_mode,version,created_at,updated_at) SELECT ?,?,?,?,?,?,?,'plsprompt-team','PLS PROMPT','published','free',1,?,? WHERE" + guard).bind(entry.id,entry.slug,recipe.title,recipe.summary,recipeText(recipe),recipe.category,JSON.stringify(recipe.tags),time,time,revision));
    statements.push(database.prepare("INSERT OR IGNORE INTO recipe_versions(id,prompt_id,version,payload,editor_id,created_at) SELECT ?,?,1,?,'plsprompt-team',? WHERE" + guard).bind(versionId,entry.id,payload,time,revision));
    statements.push(database.prepare("INSERT OR IGNORE INTO recipe_projects(prompt_id,draft,revision,published_version_id,showcase,updated_at) SELECT ?,?,1,?,1,? WHERE" + guard).bind(entry.id,payload,versionId,time,revision));
  }
  statements.push(database.prepare("INSERT OR IGNORE INTO content_revisions(id,applied_at) VALUES (?,?)").bind(revision,new Date().toISOString()));
  await database.batch(statements);
}
