import { recipeSchema } from "@/lib/recipe-types";
import { recipeDownload } from "@/lib/recipe-export";
import { z } from "zod";
import { repository } from "@/lib/data";
import { apiError, privateHeaders, readBody, requireActor } from "@/lib/api";
import { AppError } from "@/lib/repository";

const id = z.string().min(1).max(160);
const item = z.object({ recipe: recipeSchema.nullable().optional(), title: z.string().trim().min(1).max(140), promptText: z.string().max(160000), notes: z.string().max(6000), tags: z.array(z.string().trim().min(1).max(40)).max(12) });
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), promptId: id, versionId: id.optional() }),
  z.object({ action: z.literal("create"), input: item }),
  z.object({ action: z.literal("update"), id, version: z.number().int().positive(), input: item }),
  z.object({ action: z.literal("archive"), id, archived: z.boolean() }),
  z.object({ action: z.literal("restoreVersion"), id, version: z.number().int().positive(), expectedVersion: z.number().int().positive() }),
  z.object({ action: z.literal("createCollection"), title: z.string().trim().min(1).max(80) }),
  z.object({ action: z.literal("renameCollection"), id, title: z.string().trim().min(1).max(80) }),
  z.object({ action: z.literal("setCollection"), collectionId: id, itemId: id, included: z.boolean() }),
]);
export async function GET(request: Request) {
  try {
    const actor = await requireActor(); const store = await repository();
    const url = new URL(request.url); const history = url.searchParams.get("history");
    const itemId = url.searchParams.get("item");
    if (itemId && url.searchParams.get("export") === "recipe") {
      const item = (await store.library(actor)).items.find(item => item.id === itemId);
      if (!item) throw new AppError(404, "That library item is unavailable.");
      if (!item.recipe_snapshot) return new Response(`# ${item.title}\n\n${item.prompt_text}\n\n## My notes\n\n${item.notes}\n`, { headers: { ...privateHeaders, "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": 'attachment; filename="my-prompt.md"' } });
      const download = recipeDownload(recipeSchema.parse(JSON.parse(item.recipe_snapshot)), `personal v${item.version}; source ${item.source_recipe_version ?? "original"}`, item.title);
      return new Response(new Uint8Array(download.bytes), { headers: { ...privateHeaders, "Content-Type": download.type, "Content-Disposition": `attachment; filename="${download.filename}"` } });
    }
    if (history) return Response.json({ versions: await store.itemVersions(actor, history) }, { headers: privateHeaders });
    if (url.searchParams.get("export") === "json") return Response.json(await store.exportLibrary(actor), { headers: { ...privateHeaders, "Content-Disposition": 'attachment; filename="plsprompt-library.json"' } });
    return Response.json(await store.library(actor), { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const actor = await requireActor(request); const parsed = schema.safeParse(await readBody(request));
    if (!parsed.success) throw new AppError(400, parsed.error.issues[0]?.message ?? "Check the form.");
    const data = parsed.data; const store = await repository(); let result;
    switch (data.action) {
      case "save": result = await store.savePrompt(actor, data.promptId, data.versionId); break;
      case "create": result = await store.createItem(actor, data.input); break;
      case "update": result = await store.updateItem(actor, data.id, data.version, data.input); break;
      case "archive": await store.archiveItem(actor, data.id, data.archived); break;
      case "restoreVersion": result = await store.restoreItem(actor, data.id, data.version, data.expectedVersion); break;
      case "createCollection": result = await store.createCollection(actor, data.title); break;
      case "renameCollection": await store.renameCollection(actor, data.id, data.title); break;
      case "setCollection": await store.setCollection(actor, data.collectionId, data.itemId, data.included); break;
    }
    return Response.json({ result, library: await store.library(actor) }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
