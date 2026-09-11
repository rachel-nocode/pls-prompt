"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMotionPreference } from "./motion-preferences";
import { formatNames, type RecipeSummary } from "@/lib/recipe-types";

export function ProjectCard({ project, position, returnTo }: { project: RecipeSummary; position: number; returnTo: string }) {
  const href = `/prompts/${project.slug}?from=${encodeURIComponent(returnTo.replace("#prompts", `#project-${project.slug}`))}`;
  const card = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const { animate } = useMotionPreference();
  useEffect(() => {
    const element = card.current;
    if (!element || !animate || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        element.animate([{ opacity: .18 }, { opacity: 1 }], { duration: 1250, easing: "cubic-bezier(.19,1,.22,1)" });
        observer.disconnect();
      }
    }, { threshold: .12 });
    observer.observe(element);
    return () => { observer.disconnect(); element.getAnimations().forEach(animation => animation.cancel()); };
  }, [animate]);
  return <article id={`project-${project.slug}`} tabIndex={-1} ref={card} className="project-card editorial-project">
    <Link className="editorial-preview" href={href} aria-label={`Explore ${project.title}`}>
      {failed || !project.images.length ? <span className="editorial-fallback">Preview unavailable · Open project</span> : <Image unoptimized src={project.images[0]} alt={`${project.title} working app preview`} width={1440} height={900} loading={position === 0 ? "eager" : "lazy"} onError={() => setFailed(true)} />}
      <span className="preview-open" aria-hidden="true"><ArrowUpRight /></span>
    </Link>
    <div className="editorial-caption"><div className="editorial-number">{String(position + 1).padStart(2,"0")} / {project.category}</div><div><Link href={href}><h2>{project.title}</h2></Link><p>{project.summary}</p></div><Link className="editorial-cta" href={href}>Explore & get prompt <ArrowUpRight /><span>{formatNames[project.format]}</span></Link></div>
  </article>;
}
