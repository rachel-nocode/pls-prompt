"use client";
import { useMotionPreference } from "./motion-preferences";
export function FluidHero() {
  const { animate } = useMotionPreference();
  return <div className="liquid-atmosphere" data-animate={animate} aria-hidden="true"><div className="liquid-media" /><div className="liquid-fade" /></div>;
}
