import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-header";
import { getPromptsByAuthor } from "@/lib/data";
import type { PromptRecord } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireChatGPTUser("/profile");
  let prompts: PromptRecord[] = [];
  try { prompts = await getPromptsByAuthor(user.id); } catch {}
  return (
    <main>
      <SiteHeader />
      <section className="index-page profile-page">
        <div className="profile-heading">
          <div><span className="mono-label">SIGNED IN / HUMAN DETECTED</span><h1>{user.displayName}</h1><p>{user.email}</p></div>
          <a className="secondary-action" href={chatGPTSignOutPath("/")} target="_top"><LogOut aria-hidden="true" /> Sign out</a>
        </div>
        <div className="section-heading"><div><span className="mono-label">YOUR CONTRIBUTIONS</span><h2>Submitted prompts</h2></div><Link className="zine-action" href="/submit">Submit another <ArrowRight aria-hidden="true" /></Link></div>
        {prompts.length ? <div className="submission-list">{prompts.map((prompt) => <div key={prompt.id}><div><strong>{prompt.title}</strong><p>{prompt.promise}</p></div><span className={`status status-${prompt.status}`}>{prompt.status}</span></div>)}</div> : <div className="empty-state"><h3>No submissions yet.</h3><p>Your future masterpiece is currently very shy.</p><Link className="text-arrow" href="/submit">Submit a prompt <ArrowRight aria-hidden="true" /></Link></div>}
      </section>
    </main>
  );
}

