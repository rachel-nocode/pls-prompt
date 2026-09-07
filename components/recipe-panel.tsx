"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownPreview } from "./markdown-preview";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import { SavePromptButton } from "./save-prompt-button";
import { formatNames, type Recipe } from "@/lib/recipe-types";
import { recipeMarkdown, recipeText } from "@/lib/recipe-export";
export function RecipePanel({ recipe, promptId, slug, versionId, signIn, savedId }: { recipe: Recipe; promptId: string; slug: string; versionId: string; signIn: string | null; savedId?: string }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const label = recipe.format === "skill" ? "Download skill" : recipe.format === "pack" ? "Download pack" : "Download recipe";
  async function download() {
    setBusy(true); setError("");
    try { const response = await fetch(`/api/recipes/${slug}/download?version=${encodeURIComponent(versionId)}`, { method: "HEAD" }); if (!response.ok) throw new Error("Download failed. Try again."); const anchor = document.createElement("a"); anchor.href = response.url; anchor.download = `${slug}.${recipe.format === "skill" ? "zip" : "md"}`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); }
    catch { setError("Download failed. Your recipe is still here. Try again."); } finally { setBusy(false); }
  }
  const markdown = recipeMarkdown(recipe, versionId);
  return <section className="recipe-document" aria-label="Build recipe">
    <Tabs defaultValue="preview">
      <div className="recipe-document-toolbar">
        <div className="recipe-document-title"><h2>{recipe.format === "skill" ? "Skill" : "Recipe"}</h2><span>{formatNames[recipe.format]}</span></div>
        <TabsList variant="line" aria-label="Recipe view"><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="markdown">Markdown</TabsTrigger></TabsList>
        <div className="recipe-document-actions"><CopyButton text={recipeText(recipe)} label={recipe.format === "skill" ? "Copy skill" : recipe.format === "pack" ? "Copy all prompts" : "Copy prompt"} /><Button variant="ghost" onClick={download} disabled={busy}><Download />{busy ? "Preparing…" : label}</Button><SavePromptButton promptId={promptId} versionId={versionId} signIn={signIn} initialItemId={savedId} /></div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <TabsContent value="preview"><MarkdownPreview text={markdown} /></TabsContent>
      <TabsContent value="markdown"><pre className="recipe-markdown-source" tabIndex={0} aria-label="Read-only Markdown source"><code>{markdown}</code></pre></TabsContent>
    </Tabs>
  </section>;
}
