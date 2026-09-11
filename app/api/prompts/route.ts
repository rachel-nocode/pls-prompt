import { getPublishedPrompts } from "@/lib/data";
export async function GET() {
  try { return Response.json({ prompts: await getPublishedPrompts() }); }
  catch { return Response.json({ error: "Prompts are temporarily unavailable." }, { status: 503 }); }
}
