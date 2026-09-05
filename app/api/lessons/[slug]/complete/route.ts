import { z } from "zod";
import { repository } from "@/lib/data";
import { apiError, privateHeaders, readBody, requireActor } from "@/lib/api";
import { AppError } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const actor = await requireActor(request);
    const parsed = z.object({ answer: z.string().min(1).max(40), version: z.number().int().positive() }).safeParse(await readBody(request));
    if (!parsed.success) throw new AppError(400, "Choose an answer to finish this lesson.");
    const { slug } = await params;
    return Response.json(await (await repository()).completeLesson(actor, slug, parsed.data.answer, parsed.data.version), { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
