import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-header";
import { LibraryWorkspace } from "@/components/library-workspace";
import { getActor } from "@/lib/access";
import { repository } from "@/lib/data";

export const dynamic = "force-dynamic";
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const { item } = await searchParams;
  return <LibraryContent item={item} />;
}
async function LibraryContent({ item }: { item?: string }) {
  await requireChatGPTUser(item ? `/library?item=${encodeURIComponent(item)}` : "/library");
  const actor = await getActor();
  if (!actor) return null;
  const data = await (await repository()).library(actor);
  return <main><SiteHeader /><LibraryWorkspace initial={data} initialItemId={item} /></main>;
}
