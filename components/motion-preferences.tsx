"use client";
import { createContext, useContext, useEffect, useState } from "react";
const MotionContext = createContext({ animate: false });
export function MotionPreferences({ children }: { children: React.ReactNode }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"), coarse = matchMedia("(pointer: coarse), (max-width: 767px)");
    const sync = () => setAnimate(!reduced.matches && !coarse.matches && !document.hidden);
    sync(); reduced.addEventListener("change", sync); coarse.addEventListener("change", sync); document.addEventListener("visibilitychange", sync);
    return () => { reduced.removeEventListener("change", sync); coarse.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return <MotionContext.Provider value={{ animate }}>{children}</MotionContext.Provider>;
}
export const useMotionPreference = () => useContext(MotionContext);
