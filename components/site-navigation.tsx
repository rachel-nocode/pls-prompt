"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function SiteNavigation({ creator }: { creator: boolean }) {
  const pathname = usePathname();
  return <nav className="primary-nav" aria-label="Primary navigation">{[{ href: "/", label: "Explore", active: pathname === "/" || pathname.startsWith("/prompts/") }, { href: "/library", label: "My library", active: pathname === "/library" }, ...(creator ? [{ href: "/studio", label: "Studio", active: pathname === "/studio" }] : [])].map(item => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}>{item.label}</Link>)}</nav>;
}

export function SignInLink() { const path = usePathname(); return <a className="text-link" href={`/signin-with-chatgpt?return_to=${encodeURIComponent(path?.startsWith("/") && !path.startsWith("//") ? path : "/")}`} target="_top">Sign in</a>; }
