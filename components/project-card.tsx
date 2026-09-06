"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useMotionPreference } from "./motion-preferences";
import { formatNames, type RecipeSummary } from "@/lib/recipe-types";
export function ProjectCard({ project, position, returnTo }: { project: RecipeSummary; position: number; returnTo: string }) {
  const projectHref = `/prompts/${project.slug}?from=${encodeURIComponent(returnTo.replace("#prompts", `#project-${project.slug}`))}`;
  const { animate, reduced } = useMotionPreference(); const [api, setApi] = useState<CarouselApi>();
  const [hover, setHover] = useState(false), [focus, setFocus] = useState(false), [paused, setPaused] = useState(false), [visible, setVisible] = useState(false);
  const [announcement, setAnnouncement] = useState(""); const [failed, setFailed] = useState(false); const card = useRef<HTMLElement>(null);
  const automatic = (position === 0 || position === 4) && project.images.length > 1;
  const plugin = useMemo(() => AutoScroll({ speed: .2, playOnInit: false, startDelay: 0, stopOnInteraction: true, stopOnFocusIn: false }), []);
  useEffect(() => { const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting)); if (card.current) observer.observe(card.current); return () => observer.disconnect(); }, []);
  useEffect(() => { if (!api) return; const stop = () => { plugin.stop(); setPaused(true); }; api.on("pointerDown", stop); return () => { api.off("pointerDown", stop); }; }, [api, plugin]);
  useEffect(() => { if (!api) return; if (automatic && animate && visible && !hover && !focus && !paused) plugin.play(); else plugin.stop(); return () => plugin.stop(); }, [api, animate, automatic, visible, hover, focus, paused, plugin]);
  function move(direction: number) { plugin.stop(); setPaused(true); if (direction > 0) api?.scrollNext(reduced); else api?.scrollPrev(reduced); setAnnouncement(`View ${(api?.selectedScrollSnap() ?? 0) + 1} of ${project.images.length}`); }
  return <article id={`project-${project.slug}`} tabIndex={-1} ref={card} className={`project-card project-slot-${position % 5}`} data-paused={!animate || hover || focus || paused} onMouseEnter={() => { plugin.stop(); setHover(true); }} onMouseLeave={() => setHover(false)} onFocusCapture={() => { plugin.stop(); setFocus(true); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocus(false); }}>
    <div className="project-caption"><span className="project-type">{project.category}</span><Link className="project-title-link" href={projectHref}><h2>{project.title}</h2><ArrowUpRight aria-hidden="true" /></Link><p>{project.summary}</p></div>
    <div className="project-media">
      {failed || !project.images.length ? <Link className="media-fallback" href={projectHref}>Preview unavailable <ArrowUpRight /></Link> : <Carousel setApi={setApi} opts={{ loop: true, align: "start", duration: reduced ? 0 : 20 }} plugins={[plugin]} aria-label={`${project.title} previews`} onKeyDownCapture={event => { if (event.target instanceof HTMLInputElement) return; if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}><CarouselContent>{project.images.map((src, index) => <CarouselItem key={src} aria-label={`${index + 1} of ${project.images.length}`}><Link href={projectHref} aria-label={`Open ${project.title}, preview ${index + 1}`} tabIndex={index === 0 ? 0 : -1}><Image unoptimized src={src} alt="" width={1200} height={750} loading={position < 3 ? "eager" : "lazy"} onError={() => setFailed(true)} /></Link></CarouselItem>)}</CarouselContent></Carousel>}
    </div>
    <div className="project-card-footer"><span>{formatNames[project.format]}</span><div className="card-controls">{project.images.length > 1 && <><Button variant="ghost" size="icon" onClick={() => move(-1)} aria-label={`Previous ${project.title} preview`}><ChevronLeft /></Button><Button variant="ghost" size="icon" onClick={() => move(1)} aria-label={`Next ${project.title} preview`}><ChevronRight /></Button>{automatic && <Button variant="ghost" size="icon" onClick={() => setPaused(value => !value)} aria-label={`${paused ? "Resume" : "Pause"} ${project.title} previews`} aria-pressed={paused}>{paused ? <Play /> : <Pause />}</Button>}</>}<Link className="try-card" href={projectHref}>Try demo <ArrowUpRight /></Link></div></div><span className="sr-only" role="status">{announcement}</span>
  </article>;
}
