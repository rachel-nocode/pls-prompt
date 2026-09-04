import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, GitFork } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CopyButton } from "@/components/copy-button";
import { getPromptBySlug } from "@/lib/data";
import { seedPrompts } from "@/lib/content";

export const dynamic = "force-dynamic";

function list<T>(value: string): T[] {
  try { return JSON.parse(value) as T[]; } catch { return []; }
}

export default async function PromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let prompt = null;
  try { prompt = await getPromptBySlug(slug); } catch { prompt = seedPrompts.find((item) => item.slug === slug) ?? null; }
  if (!prompt) notFound();
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
          <div className="quality-block"><span>QUALITY SCORE</span><strong>{prompt.quality_score}</strong><small>/100</small></div>
        </header>
        <div className="proof-bar">
          <span className={prompt.verified ? "verified" : "community"}>{prompt.verified ? <><CheckCircle2 aria-hidden="true" /> Human verified</> : "Community prompt"}</span>
          <span><Clock3 aria-hidden="true" /> Tested {prompt.tested_at || "awaiting review"}</span>
          <span>{models.join(" · ")}</span>
        </div>
        <div className="detail-grid">
          <section className="prompt-panel">
            <div className="panel-heading"><span>PROMPT</span><span>{prompt.github_url ? "EXTERNAL SOURCE" : "READY TO COPY"}</span></div>
            {prompt.prompt_text ? <pre>{prompt.prompt_text}</pre> : (
              <div className="external-prompt">
                <GitFork aria-hidden="true" />
                <h2>This prompt lives on GitHub.</h2>
                <p>We store its quality notes and compatibility here while the maintainer keeps the source current.</p>
              </div>
            )}
            <div className="prompt-actions">
              {prompt.prompt_text && <CopyButton text={prompt.prompt_text} />}
              {prompt.github_url && <a className="github-button" href={prompt.github_url} target="_blank" rel="noreferrer"><GitFork aria-hidden="true" /> Open on GitHub <ArrowUpRight aria-hidden="true" /></a>}
              {prompt.asset_key && <a className="secondary-action" href={`/assets/${prompt.asset_key}`}>Download attachment</a>}
            </div>
          </section>
          <aside className="anatomy-panel">
            <span className="mono-label">WHY IT WORKS</span>
            <h2>Prompt anatomy</h2>
            {anatomy.map((item) => <div className="anatomy-item" key={item.label}><strong>{item.label}</strong><p>{item.text}</p></div>)}
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
