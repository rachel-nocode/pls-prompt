import { z } from "zod";
import { repository } from "@/lib/data";
import { apiError, privateHeaders, readBody, requireActor } from "@/lib/api";
import { AppError } from "@/lib/repository";

const id = z.string().min(1).max(160).nullable();
const check = z.object({ question: z.string().trim().max(350), options: z.array(z.object({ id: z.string().min(1).max(20), text: z.string().trim().max(350) })).min(2).max(4), correct: z.string().min(1).max(20), explanation: z.string().trim().max(600) }).refine(data => new Set(data.options.map(option => option.id)).size === data.options.length && data.options.some(option => option.id === data.correct), "Choose distinct options and a valid correct answer.");
const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("prompt"), id, version: z.number().int().nonnegative(), input: z.object({ title: z.string().trim().min(1).max(140), promise: z.string().trim().max(280), promptText: z.string().trim().max(30000), category: z.string().trim().min(2).max(40), tags: z.array(z.string().trim().min(1).max(40)).max(12), status: z.enum(["draft", "review", "published"]), accessMode: z.enum(["free", "earned"]) }) }),
  z.object({ kind: z.literal("lesson"), id, version: z.number().int().nonnegative(), input: z.object({ title: z.string().trim().min(1).max(140), summary: z.string().trim().max(280), body: z.string().trim().max(1800), minutes: z.number().int().min(1).max(5), position: z.number().int().min(1).max(100), prerequisiteId: id, rewardPromptId: id, published: z.boolean(), check }) }),
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
    const recordId = data.kind === "prompt" ? await store.editPrompt(actor, data.id, data.version, data.input) : await store.editLesson(actor, data.id, data.version, data.input);
    return Response.json({ id: recordId, studio: await store.studio(actor) }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
