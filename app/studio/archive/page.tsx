import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-header";
import { CreatorStudio } from "@/components/creator-studio";
import { getActor } from "@/lib/access";
import { repository } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function StudioPage() {
  await requireChatGPTUser("/studio/archive"); const actor = await getActor();
  if (!actor?.isCreator) notFound();
  const initial = await (await repository()).studio(actor);
  return <main><SiteHeader /><CreatorStudio initial={initial as Parameters<typeof CreatorStudio>[0]["initial"]} /></main>;
}
