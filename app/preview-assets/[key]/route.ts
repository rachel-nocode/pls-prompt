import { env } from "cloudflare:workers";
import { getActor } from "@/lib/access";
import { repository } from "@/lib/data";
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}) {
  const {key}=await params;
  if(!/^[a-f0-9-]+\.(?:png|jpg|webp)$/.test(key))return new Response("Not found",{status:404});
  const bucket=(env as unknown as {BUCKET?:R2Bucket}).BUCKET;const object=await bucket?.get(`recipe-images/${key}`);
  if(!object)return new Response("Not found",{status:404});
  const actor=await getActor();
  if(!(actor?.isCreator&&object.customMetadata?.owner===actor.id)&&!await(await repository()).canReadRecipeMedia(`/preview-assets/${key}`))return new Response("Not found",{status:404});
  return new Response(object.body,{headers:{"Content-Type":object.httpMetadata?.contentType??"application/octet-stream","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
