import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const safeFile = z.string().min(1).max(120).regex(/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:md|txt|json|yaml|yml)$/).refine(value => !value.startsWith(".") && !value.includes(".."), "Use a safe recipe filename.");
const mediaUrl = z.string().max(500).refine(value => !value || /^\/(?:previews|preview-assets|assets|demos)\/[a-zA-Z0-9/_?=.&%-]+$/.test(value) || (() => { try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } })(), "Use a reviewed HTTPS URL or a site asset.");
export const recipeSchema = z.object({
  title: text(140), summary: text(280), category: z.enum(["Game", "Web app", "Mini app"]),
  format: z.enum(["single", "pack", "skill"]), tags: z.array(text(40)).max(12),
  steps: z.array(z.object({ title: text(120), text: text(30000) })).max(20),
  files: z.array(z.object({ name: safeFile, content: text(30000) })).max(20),
  setup: text(3000), customize: text(3000), limits: text(3000), tool: text(180),
  demo: z.object({ url: mediaUrl, build: text(160), images: z.array(mediaUrl).max(6), reviewed: z.boolean() }),
  proof: z.object({ builtAt: text(40), model: text(120), startingPoint: text(2000), interventions: text(4000), checks: text(4000), reproduction: z.enum(["pending", "passed", "failed"]), reproductionNotes: text(4000) }),
}).superRefine((value, ctx) => {
  if (value.files.some(file => file.name.toLowerCase() === "pls-recipe.md")) ctx.addIssue({ code: "custom", message: "PLS-RECIPE.md is reserved for the download guide.", path: ["files"] });
  if (new Set(value.files.map(file => file.name.toLowerCase())).size !== value.files.length) ctx.addIssue({ code: "custom", message: "Each skill filename must be unique.", path: ["files"] });
  if (JSON.stringify(value).length > 160000) ctx.addIssue({ code: "custom", message: "Keep the recipe under 160,000 characters." });
});
export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeVersion = { id: string; prompt_id: string; version: number; payload: string; created_at: string; editor_id: string };
export type RecipeSummary = { id: string; slug: string; title: string; summary: string; category: Recipe["category"]; format: Recipe["format"]; tags: string[]; images: string[]; versionId: string; version: number; demoAvailable: boolean };
export type RecipeProject = { prompt_id: string; draft: string; revision: number; published_version_id: string | null; showcase: number; updated_at: string; slug: string };
export const formatNames = { single: "Single prompt", pack: "Prompt pack", skill: "Skill" };
export function emptyRecipe(): Recipe {
  return { title: "", summary: "", category: "Mini app", format: "single", tags: [], steps: [{ title: "Build", text: "" }], files: [], setup: "", customize: "", limits: "", tool: "", demo: { url: "", build: "", images: [], reviewed: false }, proof: { builtAt: "", model: "", startingPoint: "", interventions: "", checks: "", reproduction: "pending", reproductionNotes: "" } };
}
export function publicationProblems(recipe: Recipe): string[] {
  const missing: string[] = [];
  if (!recipe.title || !recipe.summary) missing.push("Add a title and outcome.");
  if (recipe.format === "single" && (recipe.steps.length !== 1 || !recipe.steps[0]?.text)) missing.push("A single prompt needs exactly one complete prompt.");
  if (recipe.format === "pack" && (recipe.steps.length < 2 || recipe.steps.some(step => !step.title || !step.text))) missing.push("A pack needs at least two complete, ordered prompts.");
  if (recipe.format === "skill" && (!recipe.files.some(file => file.name === "SKILL.md" && file.content) || recipe.files.some(file => !file.content))) missing.push("Add SKILL.md and complete supporting recipe files.");
  if (!recipe.tool || !recipe.setup || !recipe.customize || !recipe.limits) missing.push("Complete tool, setup, customization, and limits.");
  if (!recipe.demo.url || !recipe.demo.build || !recipe.demo.images.filter(Boolean).length || !recipe.demo.reviewed) missing.push("Add a reviewed demo, matching build reference, and real preview image.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recipe.proof.builtAt) || !Number.isFinite(Date.parse(recipe.proof.builtAt)) || !recipe.proof.startingPoint || !recipe.proof.interventions || !recipe.proof.checks) missing.push("Complete the dated build record and functional checks.");
  if (recipe.proof.reproduction !== "passed" || !recipe.proof.reproductionNotes) missing.push("Record a successful independent recipe rebuild before publishing.");
  return missing;
}
export function recipeSummary(project: { id: string; slug: string }, version: RecipeVersion): RecipeSummary {
  const recipe = recipeSchema.parse(JSON.parse(version.payload));
  return { ...project, title: recipe.title, summary: recipe.summary, category: recipe.category, format: recipe.format, tags: recipe.tags, images: recipe.demo.images, versionId: version.id, version: version.version, demoAvailable: !!recipe.demo.url };
}
