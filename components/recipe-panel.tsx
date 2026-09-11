"use client";
import { MarkdownPreview } from "./markdown-preview";
import { CopyButton } from "./copy-button";
import type { Recipe } from "@/lib/recipe-types";
import { recipeText } from "@/lib/recipe-export";

export function RecipePanel({ recipe }: { recipe: Recipe }) {
  const prompt = recipeText(recipe);
  return <section className="recipe-document" aria-label="Prompt">
    <div className="recipe-document-toolbar">
      <div className="recipe-document-title"><h2>Prompt</h2></div>
      <div className="recipe-document-actions"><CopyButton text={prompt} label="Copy prompt" /></div>
    </div>
    <MarkdownPreview text={prompt} />
  </section>;
}
