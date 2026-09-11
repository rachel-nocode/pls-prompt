import { AppError, type SqlDatabase } from "./repository.ts";
import type { Actor } from "./library-types";
import { recipeSchema, recipeSummary, publicationProblems, type Recipe, type RecipeProject, type RecipeVersion } from "./recipe-types.ts";
import { recipeText } from "./recipe-export.ts";

export function createRecipeRepository(db: SqlDatabase) {
  const q = (sql: string, ...values: unknown[]) => db.prepare(sql).bind(...values);
  const all = async <T>(sql: string, ...values: unknown[]) => (await q(sql, ...values).all<T>()).results ?? [];
  const requireCreator = (actor: Actor) => { if (!actor.isCreator) throw new AppError(403, "Creator access is required."); };
  return {
    async hasRecipeProject(promptId: string) {
      return !!await q("SELECT prompt_id FROM recipe_projects WHERE prompt_id=?", promptId).first();
    },
    async canReadRecipeMedia(url: string) {
      return !!await q("SELECT v.id FROM recipe_versions v JOIN recipe_projects r ON r.prompt_id=v.prompt_id JOIN prompts p ON p.id=v.prompt_id WHERE r.published_version_id IS NOT NULL AND p.status='published' AND p.access_mode='free' AND (json_extract(v.payload,'$.demo.url')=? OR EXISTS(SELECT 1 FROM json_each(v.payload,'$.demo.images') WHERE value=?)) LIMIT 1", url, url).first();
    },
    async gallery() {
      const records = await all<RecipeVersion & { slug: string }>("SELECT v.*,p.slug FROM recipe_projects r JOIN recipe_versions v ON v.id=r.published_version_id JOIN prompts p ON p.id=r.prompt_id WHERE r.showcase=1 AND p.status='published' AND p.access_mode='free' ORDER BY p.created_at,p.id");
      return records.map(version => recipeSummary({ id: version.prompt_id, slug: version.slug }, version));
    },
    async publishedRecipe(promptId: string, versionId?: string) {
      const version = versionId
        ? await q("SELECT v.* FROM recipe_versions v JOIN prompts p ON p.id=v.prompt_id JOIN recipe_projects r ON r.prompt_id=p.id WHERE v.prompt_id=? AND v.id=? AND r.published_version_id IS NOT NULL AND p.status='published' AND p.access_mode='free'", promptId, versionId).first<RecipeVersion>()
        : await q("SELECT v.* FROM recipe_projects r JOIN recipe_versions v ON v.id=r.published_version_id JOIN prompts p ON p.id=r.prompt_id WHERE r.prompt_id=? AND p.status='published' AND p.access_mode='free'", promptId).first<RecipeVersion>();
      return version ? { ...version, recipe: recipeSchema.parse(JSON.parse(version.payload)) } : null;
    },
    async recipeStudio(actor: Actor) {
      requireCreator(actor);
      return all<RecipeProject>("SELECT r.*,p.slug FROM recipe_projects r JOIN prompts p ON p.id=r.prompt_id ORDER BY r.updated_at DESC");
    },
    async editRecipe(actor: Actor, id: string | null, expectedRevision: number, input: Recipe, publish: boolean, showcase: boolean) {
      requireCreator(actor);
      const parsed = recipeSchema.safeParse(input);
      if (!parsed.success) throw new AppError(400, parsed.error.issues[0]?.message ?? "Check recipe fields.");
      const recipe = parsed.data;
      if (!id && expectedRevision !== 0) throw new AppError(400, "Start a new recipe at revision zero.");
      if (!recipe.title) throw new AppError(400, "Give this recipe a title.");
      const problems = publish ? publicationProblems(recipe) : [];
      if (problems.length) throw new AppError(400, problems.join(" "));
      const current = id ? await q("SELECT * FROM recipe_projects WHERE prompt_id=?", id).first<RecipeProject>() : null;
      if (id && !current) throw new AppError(404, "Recipe unavailable.");
      if (current && current.revision !== expectedRevision) throw new AppError(409, "This recipe changed. Reload before saving.");
      if (publish && current?.published_version_id) {
        const prior = await q("SELECT payload FROM recipe_versions WHERE id=?", current.published_version_id).first<{ payload: string }>();
        const previous = prior ? recipeSchema.parse(JSON.parse(prior.payload)) : null;
        const buildInput = (value: Recipe) => JSON.stringify([value.format, value.steps, value.files, value.setup, value.tool]);
        if (previous && buildInput(previous) !== buildInput(recipe) && (previous.demo.build === recipe.demo.build || previous.proof.reproductionNotes === recipe.proof.reproductionNotes)) throw new AppError(400, "Changed recipe instructions need a new matching build reference and fresh rebuild notes.");
      }
      const time = new Date().toISOString(); const recordId = id ?? crypto.randomUUID();
      const nextRevision = (current?.revision ?? 0) + 1; const versionId = crypto.randomUUID(); const payload = JSON.stringify(recipe);
      const slug = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) + "-" + recordId.slice(0, 6);
      const statements = [];
      if (!current) {
        statements.push(q("INSERT INTO prompts(id,slug,title,promise,prompt_text,category,tags,author_id,author_name,status,access_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'draft','free',?,?)", recordId, slug, recipe.title, recipe.summary, recipeText(recipe), recipe.category, JSON.stringify(recipe.tags), actor.id, actor.displayName, time, time));
        statements.push(q("INSERT INTO recipe_projects(prompt_id,draft,revision,showcase,updated_at) VALUES (?,?,0,0,?)", recordId, payload, time));
      }
      const guard = "EXISTS(SELECT 1 FROM recipe_projects WHERE prompt_id=? AND revision=?)";
      if (publish) statements.push(q("INSERT INTO recipe_versions(id,prompt_id,version,payload,editor_id,created_at) SELECT ?,?,?,?,?,? WHERE " + guard, versionId, recordId, nextRevision, payload, actor.id, time, recordId, expectedRevision));
      if (publish) statements.push(q("UPDATE prompts SET title=?,promise=?,prompt_text=?,category=?,tags=?,status='published',access_mode='free',version=version+1,updated_at=?,verified=0,quality_score=0,tested_at=NULL WHERE id=? AND " + guard, recipe.title, recipe.summary, recipeText(recipe), recipe.category, JSON.stringify(recipe.tags), time, recordId, recordId, expectedRevision));
      statements.push(publish
        ? q("UPDATE recipe_projects SET draft=?,revision=?,published_version_id=?,showcase=?,updated_at=? WHERE prompt_id=? AND revision=?", payload, nextRevision, versionId, Number(showcase), time, recordId, expectedRevision)
        : q("UPDATE recipe_projects SET draft=?,revision=?,updated_at=? WHERE prompt_id=? AND revision=?", payload, nextRevision, time, recordId, expectedRevision));
      const result = await db.batch(statements);
      if (!result.at(-1)?.meta?.changes) throw new AppError(409, "This recipe changed. Reload before saving.");
      return recordId;
    },
  };
}
