import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getPublishedLessons } from "@/lib/data";
import { seedLessons } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  let lessons = seedLessons;
  try { lessons = await getPublishedLessons(); } catch {}
  return (
    <main>
      <SiteHeader />
      <section className="index-page">
        <span className="mono-label">PLS EXPLAIN / LEARNING LIBRARY</span>
        <h1>Learn the parts that make prompts work.</h1>
        <p className="index-intro">Short lessons, real examples, and zero mystical prompt engineering fog.</p>
        <div className="lesson-list">
          {lessons.map((lesson, index) => (
            <Link href={`/learn/${lesson.slug}`} key={lesson.id}>
              <span className="lesson-number">0{index + 1}</span>
              <div><span className="mono-label">{lesson.eyebrow} / {lesson.level}</span><h2>{lesson.title}</h2><p>{lesson.summary}</p></div>
              <span className="lesson-time">{lesson.minutes} min <ArrowRight aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

