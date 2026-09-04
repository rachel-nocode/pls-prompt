import Link from "next/link";
import { ArrowRight, CheckCircle2, FlaskConical, Layers3 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PromptExplorer } from "@/components/prompt-explorer";
import { getPublishedLessons, getPublishedPrompts } from "@/lib/data";
import { seedLessons, seedPrompts } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  let prompts = seedPrompts;
  let lessons = seedLessons;
  let databaseOnline = true;
  try {
    [prompts, lessons] = await Promise.all([getPublishedPrompts(), getPublishedLessons()]);
  } catch {
    databaseOnline = false;
  }
  return (
    <main>
      <SiteHeader />
      {!databaseOnline && <div className="system-notice">Live updates are taking a tiny nap. Curated prompts are still available.</div>}
      <PromptExplorer prompts={prompts} />

      <section className="workflow-panel" aria-labelledby="workflow-heading">
        <div className="workflow-copy">
          <span className="mono-label">FEATURED WORKFLOW / 5 STAGES</span>
          <h2 id="workflow-heading">From idea to shipped app</h2>
          <p>A complete prompt chain for scoping, designing, building, testing, and launching a small product.</p>
          <Link className="zine-action" href="/prompts/turn-an-idea-into-a-product-spec">Open workflow <ArrowRight aria-hidden="true" /></Link>
        </div>
        <ol className="stage-list">
          <li><span>01</span><div><strong>Plan</strong><p>Define the result and remove accidental scope.</p></div></li>
          <li><span>02</span><div><strong>Build</strong><p>Turn requirements into the smallest coherent slice.</p></div></li>
          <li><span>03</span><div><strong>Test</strong><p>Find the failure paths before your users do.</p></div></li>
          <li><span>04</span><div><strong>Polish</strong><p>Fix the experience, not just the pixels.</p></div></li>
          <li><span>05</span><div><strong>Launch</strong><p>Ship with proof, limits, and a feedback loop.</p></div></li>
        </ol>
      </section>

      <section className="learn-section" aria-labelledby="learn-heading">
        <div className="section-heading">
          <div><span className="mono-label">LEARN THE RECIPE</span><h2 id="learn-heading">Better prompts, minus the wizard costume</h2></div>
          <Link className="text-arrow" href="/learn">All lessons <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="lesson-grid">
          {lessons.map((lesson, index) => (
            <Link className={`lesson-card lesson-${index + 1}`} href={`/learn/${lesson.slug}`} key={lesson.id}>
              {index === 0 ? <Layers3 aria-hidden="true" /> : index === 1 ? <FlaskConical aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              <span className="mono-label">{lesson.eyebrow} / {lesson.minutes} MIN</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.summary}</p>
              <span className="text-arrow">Read lesson <ArrowRight aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <div><strong>6</strong><span>launch prompts</span></div>
        <div><strong>3</strong><span>mini lessons</span></div>
        <div><strong>5</strong><span>model families</span></div>
        <div className="human-proof"><CheckCircle2 aria-hidden="true" /><span><strong>Verified by humans</strong> because robots marking their own homework felt weird.</span></div>
      </section>

      <footer><span>&gt;_ PLS PROMPT / VERSION 0.1</span><span>Built by prompters, for builders.</span></footer>
    </main>
  );
}
