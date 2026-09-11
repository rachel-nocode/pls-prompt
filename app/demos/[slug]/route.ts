import { env } from "cloudflare:workers";
import { demoBundles } from "@/lib/demo-bundles";
import { demoHeaders, uploadedDemoDocument } from "@/lib/demo-policy";
import { repository } from "@/lib/data";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  if(Object.hasOwn(demoBundles,slug)) {
    if (!await (await repository()).canReadRecipeMedia(`/demos/${slug}`)) return new Response("Demo unavailable",{status:404,headers:demoHeaders});
    return new Response(demoBundles[slug],{headers:demoHeaders});
  }
  if(!/^upload-[a-f0-9-]+$/.test(slug))return new Response("Demo unavailable",{status:404,headers:demoHeaders});
  if(!await(await repository()).canReadRecipeMedia(`/demos/${slug}`))return new Response("Demo unavailable",{status:404,headers:demoHeaders});
  const object=await(env as unknown as {BUCKET?:R2Bucket}).BUCKET?.get(`demo-assets/${slug.slice(7)}.html`);
  if(!object)return new Response("Demo unavailable",{status:404,headers:demoHeaders});
  return new Response(uploadedDemoDocument(await object.text()),{headers:demoHeaders});
}
