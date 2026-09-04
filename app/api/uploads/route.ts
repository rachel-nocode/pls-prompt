import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const allowedTypes = new Set(["text/markdown", "text/plain", "application/json", "application/pdf"]);

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to upload an attachment." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a file first." }, { status: 400 });
    if (file.size > 2_000_000) return Response.json({ error: "Files must be smaller than 2 MB." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "Use Markdown, text, JSON, or PDF." }, { status: 400 });
    const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
    if (!bucket) return Response.json({ error: "File storage is temporarily unavailable." }, { status: 503 });
    const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-80);
    const key = `prompt-assets/${user.id}/${crypto.randomUUID()}-${cleanName}`;
    await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { owner: user.id } });
    return Response.json({ assetKey: key }, { status: 201 });
  } catch {
    return Response.json({ error: "Upload failed. Try again without losing your form." }, { status: 500 });
  }
}

