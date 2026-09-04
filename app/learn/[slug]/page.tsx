import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getLessonBySlug } from "@/lib/data";
import { seedLessons } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let lesson = null;
  try { lesson = await getLessonBySlug(slug); } catch { lesson = seedLessons.find((item) => item.slug === slug) ?? null; }
  if (!lesson) notFound();
  return (
    <main>
      <SiteHeader />
      <article className="lesson-page">
        <Link className="back-link" href="/learn"><ArrowLeft aria-hidden="true" /> All lessons</Link>
        <span className="mono-label">{lesson.eyebrow} / {lesson.level} / {lesson.minutes} MIN</span>
        <h1>{lesson.title}</h1>
        <p className="lesson-deck">{lesson.summary}</p>
        <div className="lesson-body">{lesson.body.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <div className="lesson-end">THE END. GO BOTHER A ROBOT WITH BETTER INSTRUCTIONS.</div>
      </article>
    </main>
  );
}
