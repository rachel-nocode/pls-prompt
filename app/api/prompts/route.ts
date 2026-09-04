import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { createPrompt, getPublishedPrompts } from "@/lib/data";

const submissionSchema = z.object({
  title: z.string().trim().min(5).max(100),
  promise: z.string().trim().min(15).max(240),
  promptText: z.string().trim().max(20000).optional().nullable(),
  githubUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  category: z.string().trim().min(2).max(40),
  models: z.array(z.string().trim().min(1).max(50)).max(8),
  assetKey: z.string().trim().max(180).optional().nullable(),
}).refine((value) => Boolean(value.promptText || value.githubUrl || value.assetKey), {
  message: "Add prompt text, a GitHub URL, or an attachment.",
});

export async function GET() {
  try { return Response.json({ prompts: await getPublishedPrompts() }); }
  catch { return Response.json({ error: "Prompts are temporarily unavailable." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to submit a prompt." }, { status: 401 });
  try {
    const parsed = submissionSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message || "Check the submission." }, { status: 400 });
    if (parsed.data.githubUrl && new URL(parsed.data.githubUrl).hostname !== "github.com") {
      return Response.json({ error: "External prompt links must use github.com." }, { status: 400 });
    }
    const prompt = await createPrompt({
      title: parsed.data.title,
      promise: parsed.data.promise,
      promptText: parsed.data.promptText || null,
      githubUrl: parsed.data.githubUrl || null,
      assetKey: parsed.data.assetKey || null,
      category: parsed.data.category,
      models: parsed.data.models,
      authorId: user.id,
      authorName: user.displayName,
    });
    return Response.json({ prompt }, { status: 201 });
  } catch {
    return Response.json({ error: "That submission did not save. Your text is still in the form—try again." }, { status: 500 });
  }
}

