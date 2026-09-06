"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import { SavePromptButton } from "./save-prompt-button";
import { formatNames, type Recipe } from "@/lib/recipe-types";
import { recipeText } from "@/lib/recipe-export";
export function RecipePanel({ recipe, promptId, slug, versionId, signIn, savedId }: { recipe: Recipe; promptId: string; slug: string; versionId: string; signIn: string | null; savedId?: string }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const label = recipe.format === "skill" ? "Download skill" : recipe.format === "pack" ? "Download pack" : "Download recipe";
  async function download() {
    setBusy(true); setError("");
    try { const response = await fetch(`/api/recipes/${slug}/download?version=${encodeURIComponent(versionId)}`); if (!response.ok) throw new Error("Download failed. Try again."); await response.arrayBuffer(); const anchor = document.createElement("a"); anchor.href = response.url; anchor.download = `${slug}.${recipe.format === "skill" ? "zip" : "md"}`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); }
    catch { setError("Download failed. Your recipe is still here. Try again."); } finally { setBusy(false); }
  }
  return <aside className="recipe-panel" aria-label="Build recipe"><span className="mono-label">{formatNames[recipe.format]}</span><h2>Make it yours.</h2><p>{recipe.tool}</p><div className="recipe-actions">{recipe.format !== "skill" && <CopyButton text={recipeText(recipe)} label={recipe.format === "pack" ? "Copy all prompts" : "Copy prompt"} />}<Button variant={recipe.format === "skill" ? "default" : "outline"} onClick={download} disabled={busy}><Download /> {busy ? "Preparing…" : label}</Button><SavePromptButton promptId={promptId} versionId={versionId} signIn={signIn} initialItemId={savedId} /></div><Accordion type="multiple" defaultValue={["setup"]}><AccordionItem value="setup"><AccordionTrigger>Before you start</AccordionTrigger><AccordionContent><p>{recipe.setup}</p></AccordionContent></AccordionItem></Accordion>{recipe.format === "skill" && <p className="field-help">The ZIP includes your skill files and PLS-RECIPE.md with setup notes and version.</p>}{error && <p className="form-error" role="alert">{error}</p>}{recipe.format === "single" ? <pre className="recipe-content" tabIndex={0} aria-label="Complete prompt">{recipe.steps[0]?.text}</pre> : <Accordion type="multiple" defaultValue={["0"]}>{(recipe.format === "pack" ? recipe.steps.map((step, index) => ({ name: `${String(index + 1).padStart(2,"0")} / ${step.title}`, text: step.text })) : recipe.files.map(file => ({ name: file.name, text: file.content }))).map((part,index) => <AccordionItem value={String(index)} key={index}><AccordionTrigger>{part.name}</AccordionTrigger><AccordionContent><pre className="recipe-content" tabIndex={0}>{part.text}</pre><CopyButton text={part.text} label={recipe.format === "pack" ? "Copy step" : "Copy file text"} /></AccordionContent></AccordionItem>)}</Accordion>}<Accordion type="multiple"><AccordionItem value="customize"><AccordionTrigger>What to customize</AccordionTrigger><AccordionContent><p>{recipe.customize}</p></AccordionContent></AccordionItem><AccordionItem value="limits"><AccordionTrigger>Known limits</AccordionTrigger><AccordionContent><p>{recipe.limits}</p></AccordionContent></AccordionItem></Accordion></aside>;
}
