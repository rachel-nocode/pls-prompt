import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-header";
import { RecipeStudio } from "@/components/recipe-studio";
import { getActor } from "@/lib/access";
import { repository } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function StudioPage() {
  await requireChatGPTUser("/studio"); const actor = await getActor();
  if (!actor?.isCreator) notFound();
  const initial = await (await repository()).recipeStudio(actor);
  return <main><SiteHeader /><RecipeStudio initial={initial} /></main>;
}
