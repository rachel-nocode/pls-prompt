import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { getActor } from "@/lib/access";
import { SiteNavigation, SignInLink } from "./site-navigation";
import { MotionToggle } from "./motion-preferences";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export async function SiteHeader() {
  const [user, actor] = await Promise.all([getChatGPTUser(), getActor()]);
  return <header className="site-header"><Link className="wordmark" href="/" aria-label="PLS PROMPT home">PLS PROMPT</Link><SiteNavigation creator={!!actor?.isCreator} /><div className="nav-actions"><form action="/#prompts" className="header-search" role="search"><label htmlFor="global-search" className="sr-only">Search projects</label><Search aria-hidden="true" /><input id="global-search" type="search" name="q" placeholder="Search projects" /></form><MotionToggle />{user ? <Link className="icon-link" href="/profile" aria-label="Your account"><UserRound aria-hidden="true" /></Link> : <SignInLink />}</div></header>;
}
