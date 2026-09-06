import { ProjectDemo } from "@/components/project-demo";
import { RecipePanel } from "@/components/recipe-panel";
import { repository } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, GitFork } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CopyButton } from "@/components/copy-button";
import { getPromptBySlug } from "@/lib/data";
import { getActor } from "@/lib/access";
import { SavePromptButton } from "@/components/save-prompt-button";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

function list<T>(value: string): T[] {
  try { return JSON.parse(value) as T[]; } catch { return []; }
}

export default async function PromptPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> }) {
  const { slug } = await params;
  const { from } = await searchParams;
  const returnTo = from && /^\/(?:\?[^#]*)?#(?:prompts|project-[a-z0-9-]+)$/.test(from) ? from : "/#prompts";
  const actor = await getActor();
  const prompt = await getPromptBySlug(slug, actor);
  if (!prompt) notFound();
  const store = await repository();
  const published = await store.publishedRecipe(prompt.id);
  if (published) {
    const recipe = published.recipe;
    const saved = actor ? await store.libraryItemForPrompt(actor, prompt.id) : null;
    return <main><SiteHeader /><article className="project-page"><Link className="project-back" href={returnTo}><ArrowLeft /> Back to collection</Link><header className="project-heading"><div><span className="project-type">{recipe.category}</span><h1>{recipe.title}</h1><p>{recipe.summary}</p></div><span className="recipe-version-label">RECIPE {String(published.version).padStart(2, "0")} / {recipe.proof.builtAt}</span></header><div className="project-workbench"><ProjectDemo demo={recipe.demo} title={recipe.title} /><RecipePanel recipe={recipe} promptId={prompt.id} slug={slug} versionId={published.id} signIn={actor ? null : chatGPTSignInPath(`/prompts/${slug}`)} savedId={saved?.id} /><section className="build-notes"><h2>How it was made.</h2><p>{recipe.proof.startingPoint}</p><dl><div><dt>BUILT WITH</dt><dd>{recipe.tool}{recipe.proof.model ? ` · ${recipe.proof.model}` : ""}</dd></div><div><dt>BUILD RECORD</dt><dd>{recipe.demo.build}</dd></div><div><dt>STEPS & INTERVENTIONS</dt><dd>{recipe.proof.interventions}</dd></div><div><dt>WHAT WAS CHECKED</dt><dd>{recipe.proof.checks}</dd></div></dl><details><summary>Recipe reproduction</summary><p>{recipe.proof.reproductionNotes}</p></details></section></div></article></main>;
  }
  const models = list<string>(prompt.models);
  const anatomy = list<{ label: string; text: string }>(prompt.anatomy);

  return (
    <main>
      <SiteHeader />
      <article className="detail-page">
        <Link className="back-link" href="/#prompts"><ArrowLeft aria-hidden="true" /> Back to prompts</Link>
        <header className="detail-header">
          <div>
            <span className="mono-label">{prompt.category.toUpperCase()} / {prompt.difficulty.toUpperCase()}</span>
            <h1>{prompt.title}</h1>
            <p>{prompt.promise}</p>
          </div>
          <span className="project-type">Original collection</span>
        </header>
        <div className="proof-bar">
          <span className={prompt.verified ? "verified" : "community"}>{prompt.access_mode === "earned" ? "Archived lesson recipe" : "Original prompt"}</span>
          <span><Clock3 aria-hidden="true" /> Tested {prompt.tested_at || "awaiting review"}</span>
          <span>{models.join(" · ")}</span>
        </div>
        <div className="detail-grid">
          <section className="prompt-panel">
            <div className="panel-heading"><span>PROMPT</span><span>{!prompt.accessible ? "UNLOCK WITH A LESSON" : prompt.github_url ? "EXTERNAL SOURCE" : "READY TO COPY"}</span></div>
            {!prompt.accessible ? <div className="locked-recipe"><h2>Build this after a short lesson.</h2><p>Finish the linked lesson to collect the full recipe in your library.</p>{prompt.lesson ? <Link className="zine-action" href={`/learn/${prompt.lesson.slug}`}>Start lesson →</Link> : <Link className="zine-action" href="/learn">Explore lessons →</Link>}</div> : prompt.prompt_text ? <pre>{prompt.prompt_text}</pre> : (
              <div className="external-prompt">
                <GitFork aria-hidden="true" />
                <h2>{prompt.github_url ? "This prompt lives on GitHub." : "This prompt is an attachment."}</h2>
                <p>{prompt.github_url ? "Open the original source to use this prompt." : "Download the file below to use this prompt."}</p>
              </div>
            )}
            <div className="prompt-actions">
              {prompt.accessible && <SavePromptButton promptId={prompt.id} signIn={actor ? null : chatGPTSignInPath(`/prompts/${slug}`)} />}
              {prompt.prompt_text && <CopyButton text={prompt.prompt_text} />}
              {prompt.github_url && <a className="github-button" href={prompt.github_url} target="_blank" rel="noreferrer"><GitFork aria-hidden="true" /> Open on GitHub <ArrowUpRight aria-hidden="true" /></a>}
              {prompt.asset_key && <a className="secondary-action" href={`/assets/${prompt.asset_key}`}>Download attachment</a>}
            </div>
          </section>
          <aside className="anatomy-panel">
            <span className="mono-label">WHY IT WORKS</span>
            <h2>Prompt anatomy</h2>
            {anatomy.map((item) => <div className="anatomy-item" key={item.label}><strong>{item.label}</strong><p>{item.text}</p></div>)}
            {!anatomy.length && <><div className="anatomy-item"><strong>A clear outcome</strong><p>The complete product, audience, and working features are defined.</p></div><div className="anatomy-item"><strong>Useful defaults</strong><p>Design and data decisions help your AI builder get started.</p></div><div className="anatomy-item"><strong>A way to check</strong><p>Acceptance checks describe what should work when the build is done.</p></div></>}
          </aside>
        </div>
        <section className="expected-output">
          <span className="mono-label">EXPECTED OUTPUT</span>
          <h2>Know what good looks like.</h2>
          <p>{prompt.example_output}</p>
        </section>
      </article>
    </main>
  );
}
