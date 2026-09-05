import { z } from "zod";
import { repository } from "@/lib/data";
import { getActor } from "@/lib/access";
import { apiError, privateHeaders, readBody, requireSameOrigin } from "@/lib/api";
import { AppError } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    requireSameOrigin(request);
    const parsed = z.object({ answer: z.string().trim().min(1).max(2000), version: z.number().int().positive() }).safeParse(await readBody(request));
    if (!parsed.success) throw new AppError(400, "Write the missing instructions in 2,000 characters or fewer.");
    const { slug } = await params;
    return Response.json(await (await repository()).completeLesson(await getActor(), slug, parsed.data.answer, parsed.data.version), { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
