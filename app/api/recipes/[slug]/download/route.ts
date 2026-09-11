import { recordRecipeDownload } from "@/lib/download-analytics";
import { db, repository } from "@/lib/data";
import { recipeDownload } from "@/lib/recipe-export";
import { apiError, privateHeaders } from "@/lib/api";
import { AppError } from "@/lib/repository";
async function respond(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params; const store = await repository();
    const prompt = await store.promptBySlug(slug, null);
    if (!prompt?.accessible) throw new AppError(404, "Recipe unavailable.");
    const versionId = new URL(request.url).searchParams.get("version") ?? undefined;
    const version = await store.publishedRecipe(prompt.id, versionId);
    if (!version) {
      if (versionId || await store.hasRecipeProject(prompt.id)) throw new AppError(404, "Recipe version unavailable.");
      const source = prompt.prompt_text || (prompt.github_url ? `Original source: ${prompt.github_url}` : prompt.asset_key ? `Attachment: /assets/${prompt.asset_key}` : prompt.promise);
      return new Response(request.method === "HEAD" ? null : `# ${prompt.title}\n\n${source}\n`, { headers: { ...privateHeaders, "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="${slug}.md"`, "X-Content-Type-Options": "nosniff" } });
    }
    const download = recipeDownload(version.recipe, version.id, slug);
    if (request.method === "GET") {
      try {
        if (!/bot|crawler|spider|preview/i.test(request.headers.get("user-agent") ?? "")) {
          await recordRecipeDownload(db(), prompt.id, version.id);
        }
      } catch { console.error("Download analytics unavailable"); }
    }
    return new Response(request.method === "HEAD" ? null : new Uint8Array(download.bytes), { headers: { ...privateHeaders, "Content-Type": download.type, "Content-Disposition": `attachment; filename="${download.filename}"`, "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return apiError(error); }
}

export const GET = respond;
export const HEAD = respond;
