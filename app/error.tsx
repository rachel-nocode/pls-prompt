"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="work-page"><h1>Could not load this page.</h1><p>Try loading your workspace again.</p><Button onClick={reset}>Try again</Button><Link className="text-arrow" href="/">Back to directory →</Link></main>;
}
