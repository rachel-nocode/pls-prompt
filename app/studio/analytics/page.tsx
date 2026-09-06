import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-header";
import { getActor } from "@/lib/access";
import { db } from "@/lib/data";
import { downloadReport } from "@/lib/download-analytics";
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireChatGPTUser("/studio/analytics");
  if (!(await getActor())?.isCreator) notFound();
  let rows: Awaited<ReturnType<typeof downloadReport>> = [];
  let unavailable = false;
  try { rows = await downloadReport(db()); } catch { unavailable = true; }
  const total = rows.reduce((sum, row) => sum + row.downloads, 0);
  return <main><SiteHeader /><section className="work-page">
    <Link className="project-back" href="/studio">← Studio</Link>
    <div className="work-heading"><div><span className="mono-label">LAST 30 DAYS · UTC</span><h1>Recipe downloads.</h1><p>See which builds people take with them.</p></div></div>
    {unavailable ? <p role="alert">Analytics are temporarily unavailable. Try again shortly.</p> : <>
      <p className="mono-label">{total.toLocaleString()} DOWNLOAD REQUESTS</p>
      {total === 0 && <p>No downloads recorded yet. Counts start when tracking goes live.</p>}
      <div className="studio-list">{rows.map(row => <Link className="library-entry" key={row.id} href={`/prompts/${row.slug}`}><strong>{row.title}</strong><span>{row.downloads.toLocaleString()} downloads</span></Link>)}</div>
    </>}
    <p className="field-help">Counts successful public recipe download responses, including repeat downloads. Browser save completion and unique people cannot be measured here. Signed-in creator downloads, preparation checks, and recognizable bots are excluded. Copies and private library exports are not included.</p>
    <p className="field-help">Only daily totals by recipe and version are stored. No analytics cookies, visitor identifiers, emails, or IP addresses.</p>
  </section></main>;
}
