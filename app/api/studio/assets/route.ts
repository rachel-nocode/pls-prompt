import { env } from "cloudflare:workers";
import { requireActor, apiError, privateHeaders } from "@/lib/api";
import { AppError } from "@/lib/repository";
export async function POST(request: Request) {
  try {
    const actor = await requireActor(request); if (!actor.isCreator) throw new AppError(403,"Creator access is required.");
    const reader = request.body?.getReader(); if (!reader) throw new AppError(400,"Choose a file.");
    const chunks: Uint8Array[]=[]; let size=0;
    while(true) { const result=await reader.read(); if(result.done) break; size+=result.value.length; if(size>2100000){await reader.cancel();throw new AppError(413,"Use a file smaller than 2 MB.");}chunks.push(result.value); }
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    const form=await new Response(bytes,{headers:{"Content-Type":request.headers.get("content-type")??""}}).formData();
    const file=form.get("file");const kind=form.get("kind");if(!(file instanceof File)||file.size>2000000)throw new AppError(400,"Choose a file smaller than 2 MB.");
    const bucket=(env as unknown as {BUCKET?:R2Bucket}).BUCKET;if(!bucket)throw new AppError(503,"File storage is unavailable.");
    const id=crypto.randomUUID();let key:string,url:string;
    if(kind==="demo") { if(file.type!=="text/html"&&!file.name.endsWith(".html"))throw new AppError(400,"Choose a standalone HTML demo.");key=`demo-assets/${id}.html`;url=`/demos/upload-${id}`; }
    else {const extension=({"image/png":"png","image/jpeg":"jpg","image/webp":"webp"} as Record<string,string>)[file.type];if(!extension)throw new AppError(400,"Use a PNG, JPEG, or WebP image.");key=`recipe-images/${id}.${extension}`;url=`/preview-assets/${id}.${extension}`;}
    await bucket.put(key,file.stream(),{httpMetadata:{contentType:kind==="demo"?"text/html":file.type},customMetadata:{owner:actor.id}});
    return Response.json({url},{status:201,headers:privateHeaders});
  }catch(error){return apiError(error);}
}
