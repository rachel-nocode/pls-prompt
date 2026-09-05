"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUp, Check, Circle, Gift, Lightbulb, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import type { LibraryItem, PublicLesson } from "@/lib/library-types";
import type { PromptGrade } from "@/lib/exercise-types";

const draftMemory = new Map<string, string>();
const subscribeDraft = (notify: () => void) => {
  window.addEventListener("prompt-draft", notify);
  return () => window.removeEventListener("prompt-draft", notify);
};
function readDraft(key: string) {
  try { return sessionStorage.getItem(key) ?? draftMemory.get(key) ?? ""; }
  catch { return draftMemory.get(key) ?? ""; }
}
function usePromptDraft(key: string, guestKey: string) {
  const answer = useSyncExternalStore(subscribeDraft, () => readDraft(key) || (key !== guestKey ? readDraft(guestKey) : ""), () => "");
  function setAnswer(value: string) {
    draftMemory.set(key, value);
    try { sessionStorage.setItem(key, value); } catch { /* Keep typing when browser storage is unavailable. */ }
    if (key !== guestKey) {
      draftMemory.delete(guestKey);
      try { sessionStorage.removeItem(guestKey); } catch { /* The in-memory draft still works. */ }
    }
    window.dispatchEvent(new Event("prompt-draft"));
  }
  return [answer, setAnswer] as const;
}

type Props = { lesson: PublicLesson; completed: boolean; locked: boolean; signIn: string | null; localPreview: boolean; learnerKey: string; previous: { slug: string; title: string } | null; next: { slug: string; title: string } | null; initialReward: LibraryItem | null };
export function LessonPlayer({ lesson, completed, locked, signIn, localPreview, learnerKey, previous, next, initialReward }: Props) {
  const exercise = lesson.exercise;
  const draftKey = "pls-prompt:exercise:" + lesson.id + ":" + lesson.version + ":";
  const [answer, setAnswer] = usePromptDraft(draftKey + learnerKey, draftKey + "guest");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(completed);
  const [grade, setGrade] = useState<PromptGrade | null>(null);
  const [hints, setHints] = useState(0);
  const [error, setError] = useState("");
  const [reward, setReward] = useState<LibraryItem | null>(initialReward);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (grade || error) feedbackRef.current?.focus(); }, [grade, error]);
  async function finish() {
    if (busy || !answer.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/lessons/" + encodeURIComponent(lesson.slug) + "/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer, version: lesson.version }) });
      const body = await response.json() as { error?: string; grade: PromptGrade; completed: boolean; item: LibraryItem | null };
      if (!response.ok) throw new Error(body.error || "Could not check your prompt. Try again.");
      setGrade(body.grade);
      if (body.completed) { setDone(true); setReward(body.item); }
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="work-page prompt-lab">
    <div className="lab-topline"><Link className="back-link" href="/learn"><ArrowLeft /> Beginner path</Link><span className="mono-label">LESSON {String(lesson.position).padStart(2, "0")} · {lesson.minutes} MIN</span></div>
    <header className="lab-heading"><span className="mono-label">LEARN BY WRITING</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></header>
    <div className="prompt-lab-grid">
      <aside className="lab-guide">
        <details className="lesson-notes" open><summary><span className="mono-label">01 / THE IDEA</span><span>Read the mini lesson</span></summary><div>{lesson.body.split(/\n\s*\n/).filter(Boolean).map((part, index) => <p key={index}>{part}</p>)}</div></details>
        <div className={"lab-reward " + (done ? "collected" : "")}><span className="mono-label"><Gift />{done ? "IN YOUR LIBRARY" : "FINISH & COLLECT"}</span><h2>{lesson.reward_title || "Your next project recipe"}</h2><p>{lesson.reward_promise}</p><span className="recipe-caption">Full build prompt · Copy ready</span>{done && <Link href={reward ? "/library?item=" + encodeURIComponent(reward.id) : "/library"}>Open my recipe <ArrowRight /></Link>}</div>
      </aside>
      <div className="lab-workspace">
        {locked && !done ? <div className="lesson-locked lab-message"><Lock /><h2>One step at a time.</h2><p>Finish the previous lesson to start this one.</p>{previous && <Button asChild><Link href={"/learn/" + previous.slug}>{previous.title}<ArrowRight /></Link></Button>}</div>
        : !exercise ? <div className="lab-message"><h2>This exercise is being prepared.</h2><p>Try another lesson while we finish it.</p><Link className="text-arrow" href="/learn">Back to the path →</Link></div>
        : <><div className="lab-goal"><div className="prompt-orb" aria-hidden="true" /><span className="mono-label">02 / YOUR GOAL</span><h2>{exercise.goal}</h2><p>We started the prompt. You write the missing part.</p></div>
          <form className="prompt-composer" onSubmit={event => { event.preventDefault(); void finish(); }} aria-busy={busy}>
            <div className="composer-heading"><span className="mono-label">PROMPT IN PROGRESS</span><span>Your words, your way</span></div>
            <p className="prompt-given" id="prompt-prefix">{exercise.prefix}</p>
            <label htmlFor="prompt-answer" className="mono-label prompt-answer-label">YOUR TURN</label>
            <Textarea ref={inputRef} id="prompt-answer" name="answer" className="prompt-answer" value={answer} maxLength={2000} disabled={busy} aria-describedby="prompt-prefix prompt-suffix prompt-help" placeholder={exercise.placeholder} onChange={event => { setAnswer(event.target.value); setGrade(null); setError(""); }} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); void finish(); } }} />
            <p className="prompt-suffix" id="prompt-suffix">{exercise.suffix}</p>
            <div className="composer-footer"><span id="prompt-help">{answer.length.toLocaleString()} / 2,000 <span>· ⌘ / Ctrl + Enter</span></span><Button type="submit" className="prompt-submit" disabled={busy || !answer.trim()}>{busy ? "Checking…" : grade?.passed ? "Check again" : "Check my prompt"}<ArrowUp /></Button></div>
          </form>
          <div className="lab-tools"><Button variant="ghost" type="button" disabled={hints >= exercise.hints.length} onClick={() => setHints(hints + 1)}><Lightbulb />{hints ? "Another hint" : "Give me a hint"}</Button><span>Guided checks · Unlimited tries</span></div>
          {hints > 0 && <div className="prompt-hints" role="status">{exercise.hints.slice(0, hints).map((hint, index) => <p key={hint}><span>Hint {index + 1}</span>{hint}</p>)}</div>}
          <div className="prompt-feedback" ref={feedbackRef} tabIndex={-1} aria-live="polite" aria-atomic="true">
            {error ? <div role="alert" className="form-error">{error} Your draft is still here.</div> : <>
              <div className="feedback-heading"><span className="mono-label">03 / {grade ? "YOUR FEEDBACK" : "WHAT WE’RE CHECKING"}</span><span>{grade ? grade.checks.filter(check => check.passed).length : 0} / {exercise.criteria.length}</span></div>
              {grade && <div className={"grade-message " + (grade.passed ? "passed" : "")}><h3>{grade.passed ? done ? "Recipe collected." : "Practice passed." : "Almost there. Keep shaping it."}</h3><p>{grade.message}</p></div>}
              <ul className="prompt-checks">{exercise.criteria.map(criterion => {
                const result = grade?.checks.find(check => check.id === criterion.id);
                return <li key={criterion.id} className={result?.passed ? "passed" : ""}>{result?.passed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}<div><span>{criterion.label}</span>{result && !result.passed && <p>{result.feedback}</p>}</div><small>{result ? result.passed ? "Included" : "Add this" : "To include"}</small></li>;
              })}</ul>
              {grade && !grade.passed && <Button type="button" variant="outline" onClick={() => inputRef.current?.focus()}><RotateCcw />Revise my prompt</Button>}
              {grade?.passed && !done && <div className="practice-next"><p>{localPreview ? "You can practice here. Saving progress and collecting recipes needs sign-in on the published site." : "Sign in, then check your prompt again to save this lesson and collect the full recipe."}</p>{signIn && !localPreview && <Button asChild><a href={signIn} target="_top">Sign in to collect <Gift /></a></Button>}{next && <Link className="text-arrow" href={"/learn/" + next.slug}>Practice the next lesson <ArrowRight /></Link>}</div>}
              {done && reward && <div className="collected-recipe"><div><Gift /><h3>Your full project recipe is ready.</h3></div><div className="action-row"><CopyButton text={reward.prompt_text} /><Button asChild variant="outline"><Link href={"/library?item=" + encodeURIComponent(reward.id)}>Open in my library <ArrowRight /></Link></Button></div><details className="reward-preview"><summary>Read the full recipe</summary><pre>{reward.prompt_text}</pre></details>{next && <Link className="text-arrow" href={"/learn/" + next.slug}>Next: {next.title}<ArrowRight /></Link>}</div>}
            </>}
          </div>
          <details className="grading-note"><summary>How these checks work</summary><p>Guided checks look for the actions in the goal. If a check misses your meaning, try a shorter, more direct instruction. You can revise as often as you like.</p></details>
          {answer.trim() && <details className="reward-preview assembled-prompt"><summary>Preview your complete prompt</summary><pre>{[exercise.prefix, answer, exercise.suffix].filter(Boolean).join("\n\n")}</pre></details>}
        </>}
      </div>
    </div>
  </section>;
}
