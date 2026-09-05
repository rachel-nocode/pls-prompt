"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { CopyButton } from "@/components/copy-button";
import type { LibraryItem, PublicLesson } from "@/lib/library-types";

export function LessonPlayer({ lesson, completed, locked, signIn, previous, next, initialReward }: { lesson: PublicLesson; completed: boolean; locked: boolean; signIn: string | null; previous: { slug: string; title: string } | null; next: { slug: string; title: string } | null; initialReward: LibraryItem | null }) {
  const parts = lesson.body.split(/\n\s*\n/).filter(Boolean);
  const [step, setStep] = useState(0); const [answer, setAnswer] = useState(""); const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(completed); const [feedback, setFeedback] = useState(""); const [error, setError] = useState(""); const [reward, setReward] = useState<LibraryItem | null>(initialReward);
  async function finish() {
    setBusy(true); setError(""); setFeedback("");
    try {
      const response = await fetch("/api/lessons/" + encodeURIComponent(lesson.slug) + "/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer, version: lesson.version }) });
      const body = await response.json() as { error?: string; explanation: string; completed: boolean; item: LibraryItem | null }; if (!response.ok) throw new Error(body.error);
      setFeedback(body.explanation); if (body.completed) { setDone(true); setReward(body.item); }
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="work-page lesson-workspace">
    <Link className="back-link" href="/learn"><ArrowLeft /> Beginner path</Link>
    <div className="lesson-heading"><span className="mono-label">LESSON {lesson.position} / BEGINNER / {lesson.minutes} MIN</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div>
    <div className="lesson-play-grid"><div className="lesson-stage">
      {locked && !done ? <div className="lesson-locked"><Lock /><h2>One step at a time.</h2><p>Finish the previous lesson to start this one.</p>{previous && <Button asChild><Link href={"/learn/" + previous.slug}>{previous.title}<ArrowRight /></Link></Button>}</div>
      : done ? <div className="lesson-finished"><span className="reward-stamp"><Check /> COLLECTED</span><h2>Your next project<br />starts here.</h2><p>{feedback || "Lesson complete. Your full project recipe is saved in your library."}</p>
        <div className="action-row"><Button asChild><Link href={reward ? "/library?item=" + encodeURIComponent(reward.id) : "/library"}>Open my recipe <ArrowRight /></Link></Button>{reward && <CopyButton text={reward.prompt_text} />}</div>
        {reward && <details className="reward-preview"><summary>Read the full recipe</summary><pre>{reward.prompt_text}</pre></details>}
        {next && <Link className="text-arrow" href={"/learn/" + next.slug}>Next: {next.title} →</Link>}
        <Button variant="ghost" onClick={() => { setDone(false); setStep(0); }}>Review this lesson</Button></div>
      : <><div className="step-status"><span>{step < parts.length ? "Step " + (step + 1) + " of " + parts.length : "Quick check"}</span><span>{step < parts.length ? "ONE IDEA AT A TIME" : "ONE ANSWER TO FINISH"}</span></div><Progress value={step / (parts.length + 1) * 100} aria-label="Lesson progress" />
        {step < parts.length ? <div className="lesson-bite"><span className="lesson-bite-number">0{step + 1}</span><p>{parts[step]}</p><div className="action-row">{step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}<Button onClick={() => setStep(step + 1)}>{step === parts.length - 1 ? "Try the quick check" : "Got it. Next"}<ArrowRight /></Button></div></div>
        : <div className="lesson-question"><h2 id="lesson-question">{lesson.question || "This lesson's quick check is being prepared."}</h2><RadioGroup disabled={busy} aria-labelledby="lesson-question" value={answer} onValueChange={value => { setAnswer(value); setFeedback(""); }}>{lesson.options.map(option => <label key={option.id} className={"answer-option " + (answer === option.id ? "chosen" : "")}><RadioGroupItem value={option.id} aria-label={option.text} /><span>{option.text}</span></label>)}</RadioGroup>
          {feedback && <p className="form-notice" role="status">{feedback}</p>}{error && <p className="form-error" role="alert">{error}</p>}
          <div className="action-row"><Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))}>Read again</Button>{signIn ? <Button asChild><a href={signIn} target="_top">Sign in to collect your recipe</a></Button> : <Button onClick={finish} disabled={!answer || busy || !lesson.options.length}>{busy ? "Checking…" : "Check & collect"}<Gift /></Button>}</div></div>}</>}
    </div><aside className={"reward-card " + (done ? "unlocked" : "")}><div className="reward-card-top"><Gift /><span className="mono-label">{done ? "IN YOUR LIBRARY" : "YOUR COMPLETION REWARD"}</span></div><h2>{lesson.reward_title || "A complete project recipe"}</h2><p>{lesson.reward_promise || "A copy-ready prompt for your next build."}</p><ul><li>Complete build instructions</li><li>Design, features, and data plan</li><li>Checks for a working project</li></ul><div className="recipe-note">One prompt. Ready to paste into your AI builder.</div></aside></div>
  </section>;
}
