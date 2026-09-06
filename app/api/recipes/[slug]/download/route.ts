import { repository } from "@/lib/data";
import { recipeDownload } from "@/lib/recipe-export";
import { apiError, privateHeaders } from "@/lib/api";
import { AppError } from "@/lib/repository";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params; const store = await repository();
    const prompt = await store.promptBySlug(slug, null);
    if (!prompt?.accessible) throw new AppError(404, "Recipe unavailable.");
    const versionId = new URL(request.url).searchParams.get("version") ?? undefined;
    const version = await store.publishedRecipe(prompt.id, versionId);
    if (!version) throw new AppError(404, "Recipe version unavailable.");
    const download = recipeDownload(version.recipe, version.id, slug);
    return new Response(new Uint8Array(download.bytes), { headers: { ...privateHeaders, "Content-Type": download.type, "Content-Disposition": `attachment; filename="${download.filename}"`, "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return apiError(error); }
}
