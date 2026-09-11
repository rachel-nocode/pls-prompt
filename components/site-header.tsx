import Link from "next/link";
import { Search } from "lucide-react";
export function SiteHeader() {
  return <header className="site-header"><Link className="wordmark" href="/" aria-label="PLS PROMPT home">PLS PROMPT</Link><form action="/#prompts" className="header-search" role="search"><label htmlFor="global-search" className="sr-only">Search projects</label><Search aria-hidden="true" /><input id="global-search" type="search" name="q" placeholder="Search projects" /></form></header>;
}
