import { env } from "cloudflare:workers";
import { repository } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const assetKey = key.join("/");
  if (!await (await repository()).canReadAsset(assetKey, null)) return new Response("Not found", { status: 404, headers: { "Cache-Control": "private, no-store" } });
  const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!bucket) return new Response("Storage unavailable", { status: 503 });
  const object = await bucket.get(assetKey);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "private, no-store");
  headers.set("etag", object.httpEtag);
  headers.set("content-disposition", "attachment");
  return new Response(object.body, { headers });
}
