import { SiteHeader } from "@/components/site-header";
import { ProjectGallery } from "@/components/project-gallery";
import { repository } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams; const store = await repository();
  const projects = await store.gallery();
  return <main><SiteHeader /><ProjectGallery projects={projects} initialQuery={q ?? ""} initialCategory={category && ["Game","Web app","Mini app"].includes(category) ? category : "All projects"} /></main>;
}
