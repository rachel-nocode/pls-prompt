"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
const MotionContext = createContext({ animate: false, paused: false, reduced: true, coarse: true, toggle: () => {} });
export function MotionPreferences({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState({ ready: false, paused: false, reduced: true, coarse: true, hidden: false });
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"); const coarse = matchMedia("(pointer: coarse), (max-width: 767px)");
    const sync = () => { setPreferences(current => { let paused = current.paused; try { paused = localStorage.getItem("pls-pause-motion") === "true"; } catch {} return { ready: true, paused, reduced: reduced.matches, coarse: coarse.matches, hidden: document.hidden }; }); };
    sync(); reduced.addEventListener("change", sync); coarse.addEventListener("change", sync); document.addEventListener("visibilitychange", sync); window.addEventListener("storage", sync);
    return () => { reduced.removeEventListener("change", sync); coarse.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = () => setPreferences(current => { const paused = !current.paused; try { localStorage.setItem("pls-pause-motion", String(paused)); } catch {} return { ...current, paused }; });
  return <MotionContext.Provider value={{ ...preferences, animate: preferences.ready && !preferences.paused && !preferences.reduced && !preferences.coarse && !preferences.hidden, toggle }}>{children}</MotionContext.Provider>;
}
export const useMotionPreference = () => useContext(MotionContext);
export function MotionToggle() {
  const { paused, reduced, coarse, toggle } = useMotionPreference();
  return <Button className="motion-toggle" variant="ghost" size="icon" aria-label={paused ? "Resume motion" : "Pause motion"} title={reduced || coarse ? "Motion is off for this device" : paused ? "Resume motion" : "Pause motion"} aria-pressed={paused} onClick={toggle}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</Button>;
}
