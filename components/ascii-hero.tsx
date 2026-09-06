"use client";
import { useEffect, useRef, useState } from "react";
import { asciiPortal } from "@/lib/ascii-portal";
import { useMotionPreference } from "./motion-preferences";
export function AsciiHero() {
  const [art, setArt] = useState(() => asciiPortal()); const ref = useRef<HTMLPreElement>(null); const [visible, setVisible] = useState(false); const { animate } = useMotionPreference();
  useEffect(() => { const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting)); if (ref.current) observer.observe(ref.current); return () => observer.disconnect(); }, []);
  useEffect(() => { if (!animate || !visible) return; const start = performance.now(); const timer = setInterval(() => setArt(asciiPortal((performance.now() - start) / 18000 * Math.PI * 2)), 1000 / 12); return () => clearInterval(timer); }, [animate, visible]);
  return <pre ref={ref} className="ascii-portal" aria-hidden="true">{art}</pre>;
}
