import { env } from "cloudflare:workers";
import { getActor } from "@/lib/access";
import { repository } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!bucket) return new Response("Storage unavailable", { status: 503 });
  const actor = await getActor();
  const assetKey = key.join("/");
  const object = await bucket.get(assetKey);
  if (!object) return new Response("Not found", { status: 404 });
  if (!(actor && object.customMetadata?.owner === actor.id) && !await (await repository()).canReadAsset(assetKey, actor)) return new Response("Not found", { status: 404, headers: { "Cache-Control": "private, no-store" } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "private, no-store");
  headers.set("etag", object.httpEtag);
  headers.set("content-disposition", "attachment");
  return new Response(object.body, { headers });
}
