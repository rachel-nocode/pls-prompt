import { recipeSchema } from "@/lib/recipe-types";
import { z } from "zod";
import { repository } from "@/lib/data";
import { apiError, privateHeaders, readBody, requireActor } from "@/lib/api";
import { AppError } from "@/lib/repository";

const id = z.string().min(1).max(160).nullable();
const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("recipe"), id, version: z.number().int().nonnegative(), input: recipeSchema, publish: z.boolean(), showcase: z.boolean() }),
  z.object({ kind: z.literal("prompt"), id, version: z.number().int().nonnegative(), input: z.object({ title: z.string().trim().min(1).max(140), promise: z.string().trim().max(280), promptText: z.string().trim().max(30000), category: z.string().trim().min(2).max(40), tags: z.array(z.string().trim().min(1).max(40)).max(12), status: z.enum(["draft", "review", "published"]), accessMode: z.enum(["free", "earned"]) }) }),
]);
export async function GET() {
  try { const actor = await requireActor(); return Response.json(await (await repository()).studio(actor), { headers: privateHeaders }); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const actor = await requireActor(request);
    if (!actor.isCreator) throw new AppError(403, "Creator access is required.");
    const parsed = schema.safeParse(await readBody(request));
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0]?.message ?? "Check the form.");
    const data = parsed.data; const store = await repository();
    const recordId = data.kind === "recipe" ? await store.editRecipe(actor, data.id, data.version, data.input, data.publish, data.showcase) : await store.editPrompt(actor, data.id, data.version, data.input);
    return Response.json({ id: recordId, studio: await store.studio(actor) }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
