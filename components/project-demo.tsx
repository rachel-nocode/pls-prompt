"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/recipe-types";
export function ProjectDemo({ demo, title }: { demo: Recipe["demo"]; title: string }) {
  const [active, setActive] = useState(false), [attempt, setAttempt] = useState(0), [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle"), [image, setImage] = useState(0), [imageFailed, setImageFailed] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null); const play = useRef<HTMLButtonElement>(null);
  const local = demo.url.startsWith("/demos/");
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setState(value => value === "ready" ? value : "failed"), 15000);
    const ready = (event: MessageEvent) => { if (event.source !== frame.current?.contentWindow || event.origin !== "null" || !["pls-demo-ready","pls-demo-error"].includes(event.data?.type)) return; clearTimeout(timer); setState(event.data.type === "pls-demo-ready" ? "ready" : "failed"); };
    window.addEventListener("message", ready); return () => { clearTimeout(timer); window.removeEventListener("message", ready); };
  }, [active, attempt]);
  function start() { setState("loading"); setAttempt(value => value + 1); setActive(true); }
  return <section className="demo-panel" aria-label={`${title} demo`}><div className="demo-toolbar"><span>{active ? "PLAYGROUND / SAMPLE SESSION" : "PROJECT PREVIEW"}</span><div className="action-row">{active && <><Button variant="ghost" onClick={start}><RotateCcw /> Reset</Button><Button variant="ghost" onClick={() => { setActive(false); setState("idle"); requestAnimationFrame(() => play.current?.focus()); }}><X /> Close demo</Button></>}{demo.url && <Button asChild variant="ghost"><a href={demo.url} target="_blank" rel="noopener noreferrer">Open demo <ArrowUpRight /></a></Button>}</div></div><div className="demo-stage">{active ? <iframe ref={frame} key={attempt} src={demo.url} title={`${title} interactive demo`} sandbox="allow-scripts" allow="autoplay 'none'; camera 'none'; microphone 'none'; geolocation 'none'" referrerPolicy="no-referrer" onLoad={() => { if (!local) setState("ready"); }} onError={() => setState("failed")} /> : <>{demo.images[image] && !imageFailed && <Image unoptimized src={demo.images[image]} alt={`${title} project preview`} width={1200} height={750} onError={() => setImageFailed(true)} />}<div className="demo-cover"><Button ref={play} onClick={start} disabled={!demo.url}><Play /> Try demo</Button>{(!demo.url || imageFailed) && <p>Preview unavailable. Your recipe is below.</p>}</div></>}</div>{active && state !== "ready" && <div className="demo-state" role={state === "failed" ? "alert" : "status"}>{state === "failed" ? <><span>This preview did not respond.</span><Button variant="outline" onClick={start}>Retry demo</Button></> : "Opening your playground…"}</div>}{!active && demo.images.length > 1 && <div className="demo-thumbnail-strip" aria-label="Project views">{demo.images.map((src, index) => <button type="button" key={src} aria-pressed={index === image} aria-label={`Show ${title} view ${index + 1}`} onClick={() => { setImage(index); setImageFailed(false); }}><Image unoptimized src={src} alt="" width={100} height={60} /></button>)}</div>}</section>;
}
