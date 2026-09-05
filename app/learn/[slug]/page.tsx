import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { LessonPlayer } from "@/components/lesson-player";
import { getPublishedLessons, repository } from "@/lib/data";
import { getActor } from "@/lib/access";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lessons = await getPublishedLessons(); const lesson = lessons.find(lesson => lesson.slug === slug);
  if (!lesson) notFound();
  const actor = await getActor(); const store = await repository();
  const completions = actor ? await store.completions(actor) : [];
  const completed = new Set(completions.map(row => row.lesson_id));
  const completion = completions.find(row => row.lesson_id === lesson.id);
  const initialReward = actor && completion?.reward_prompt_id ? await store.libraryItemForPrompt(actor, completion.reward_prompt_id) : null;
  const previous = lessons.find(item => item.id === lesson.prerequisite_id) ?? null;
  const next = lessons.find(item => item.prerequisite_id === lesson.id) ?? null;
  return <main><SiteHeader /><LessonPlayer key={lesson.id + ":" + lesson.version + ":" + (actor?.id ?? "guest")} lesson={lesson} learnerKey={actor?.id ?? "guest"} localPreview={process.env.NODE_ENV === "development"} completed={completed.has(lesson.id)} locked={Boolean(actor && previous && !completed.has(previous.id))} signIn={actor ? null : chatGPTSignInPath("/learn/" + slug)} previous={previous} next={next} initialReward={initialReward} /></main>;
}
