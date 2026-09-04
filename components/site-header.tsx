import Link from "next/link";
import { Bookmark, GitFork, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";

export async function SiteHeader() {
  const user = await getChatGPTUser();
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="PlsPrompt home">
        <span className="cursor-mark">&gt;_</span> PLSPROMPT
      </Link>
      <nav className="primary-nav" aria-label="Primary navigation">
        <Link href="/#prompts">Prompts</Link>
        <Link href="/learn">Learn</Link>
        <Link href="/profile">My prompts</Link>
      </nav>
      <div className="nav-actions">
        <a className="icon-link" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
          <GitFork aria-hidden="true" />
        </a>
        {user ? (
          <>
            <Link className="account-pill" href="/profile">
              <Bookmark aria-hidden="true" />
              <span>{user.displayName.split("@")[0]}</span>
            </Link>
            <a className="text-link" href={chatGPTSignOutPath("/")} target="_top">Sign out</a>
          </>
        ) : (
          <a className="text-link" href={chatGPTSignInPath("/")} target="_top">Sign in</a>
        )}
        <Button asChild className="submit-button">
          <Link href="/submit"><Plus aria-hidden="true" /> Submit</Link>
        </Button>
      </div>
    </header>
  );
}
