import Link from "next/link";
import { ArrowRight, Check, Gift, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Progress } from "@/components/ui/progress";
import { getPublishedLessons, repository } from "@/lib/data";
import { getActor } from "@/lib/access";
export const dynamic = "force-dynamic";
export default async function LearnPage() {
  const actor = await getActor(); const lessons = await getPublishedLessons();
  const completed = new Set(actor ? (await (await repository()).completions(actor)).map(row => row.lesson_id) : []);
  const doneCount = lessons.filter(lesson => completed.has(lesson.id)).length;
  return <main><SiteHeader /><section className="work-page learn-map">
    <div className="work-heading"><div><span className="mono-label">START HERE / BEGINNER PATH</span><h1>Small lessons.<br />Big projects.</h1><p>Learn one idea. Pass a quick check. Collect a complete project recipe.</p></div><div className="path-progress"><span>{doneCount} of {lessons.length} recipes collected</span><Progress value={lessons.length ? doneCount / lessons.length * 100 : 0} aria-label="Beginner path progress" /><Link href="/library">Open my library →</Link></div></div>
    <div className="lesson-path">{lessons.map((lesson, index) => {
      const done = completed.has(lesson.id); const locked = Boolean(actor && lesson.prerequisite_id && !completed.has(lesson.prerequisite_id) && !done);
      return <article className={"path-card " + (done ? "complete" : "")} key={lesson.id}><div className="path-number">{done ? <Check /> : String(index + 1).padStart(2, "0")}</div><div className="path-lesson"><span className="mono-label">BEGINNER · {lesson.minutes} MINUTES</span><h2>{lesson.title}</h2><p>{lesson.summary}</p><Link className="path-start" href={"/learn/" + lesson.slug}>{done ? "Review lesson" : locked ? "View lesson" : "Start lesson"}{locked ? <Lock /> : <ArrowRight />}</Link></div><div className="path-reward"><span className="mono-label"><Gift />{done ? "COLLECTED" : "UNLOCK THIS PROJECT"}</span><h3>{lesson.reward_title}</h3><p>{lesson.reward_promise}</p></div></article>;
    })}</div><p className="path-footnote">New to AI? Start at lesson one. Your recipes and progress stay saved to your account.</p>
  </section></main>;
}
