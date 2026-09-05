"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PromptSummary } from "@/lib/library-types";

const categories = ["All", "Projects", "Code", "Research", "Writing", "Marketing"];

function list(value: string): string[] {
  try { return JSON.parse(value) as string[]; } catch { return []; }
}

function PromptCard({ prompt }: { prompt: PromptSummary }) {
  return (
    <article className="prompt-card">
      <div className="card-topline">
        <span className="mono-label">PROMPT / {prompt.category.toUpperCase()}</span>
        {prompt.access_mode === "earned" ? <span className="community">Lesson reward</span> : prompt.verified ? (
          <span className="verified"><Check aria-hidden="true" /> Human verified</span>
        ) : (
          <span className="community">Community</span>
        )}
      </div>
      <h3><Link href={`/prompts/${prompt.slug}`}>{prompt.title}</Link></h3>
      <p>{prompt.promise}</p>
      <div className="tag-row">
        {list(prompt.tags).slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
      </div>
      <div className="card-footer">
        <span className="model-list">{list(prompt.models).join(" · ")}</span>
        <span className="score">{prompt.access_mode === "earned" ? "EARN IT" : prompt.quality_score || "NEW"}</span>
      </div>
    </article>
  );
}

export function PromptExplorer({ prompts }: { prompts: PromptSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const results = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const inCategory = category === "All" || prompt.category === category;
      const haystack = `${prompt.title} ${prompt.promise} ${prompt.category} ${prompt.tags}`.toLowerCase();
      return inCategory && (!clean || haystack.includes(clean));
    });
  }, [category, prompts, query]);

  return (
    <>
      <section className="hero-grid" aria-labelledby="hero-title">
        <div className="zine-hero">
          <span className="corner corner-one" aria-hidden="true" />
          <span className="corner corner-two" aria-hidden="true" />
          <p className="mono-label">HIGH-SIGNAL PROMPTS. REAL RESULTS.</p>
          <h1 id="hero-title">Turn vague ideas into <span>very specific wins.</span></h1>
          <p className="hero-note">Learn a little. Unlock a full project recipe. Keep every useful prompt in your own library.</p>
          <div className="sticker" aria-hidden="true">COPY.<br />CUSTOMIZE.<br />CRUSH IT.</div>
        </div>
        <div className="search-console">
          <div className="console-label"><Sparkles aria-hidden="true" /> Stop yelling at the robot</div>
          <label htmlFor="prompt-search">What do you want to build?</label>
          <div className="search-row">
            <div className="search-field">
              <Search aria-hidden="true" />
              <Input id="prompt-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompts, outcomes, and skills..." />
            </div>
            <Button className="search-button" onClick={() => document.getElementById("prompts")?.scrollIntoView({ behavior: "smooth" })}>
              Search <ArrowUpRight aria-hidden="true" />
            </Button>
          </div>
          <p className="search-meta">Works with ChatGPT · Claude · Gemini · Codex</p>
        </div>
      </section>
      <div className="category-rail" aria-label="Filter prompts by category">
        {categories.map((item) => (
          <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} type="button">{item}</button>
        ))}
      </div>
      <section className="prompt-section" id="prompts" aria-labelledby="prompt-heading">
        <div className="section-heading">
          <div><span className="mono-label">DIRECTORY / V0.1</span><h2 id="prompt-heading">Prompts that explain themselves</h2></div>
          <span className="result-count">{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
        {results.length ? (
          <div className="prompt-grid">{results.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}</div>
        ) : (
          <div className="empty-state">
            <span className="empty-face">¯\_(ツ)_/¯</span>
            <h3>The prompt cupboard is empty.</h3>
            <p>Try fewer words or reset the category filter.</p>
            <Button onClick={() => { setQuery(""); setCategory("All"); }}>Reset filters</Button>
          </div>
        )}
      </section>
    </>
  );
}
