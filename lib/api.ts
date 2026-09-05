import { getActor } from "./access";
import { AppError } from "./repository";

export const privateHeaders = { "Cache-Control": "private, no-store" };
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new AppError(403, "Open this page directly before saving.");
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new AppError(403, "Open this page directly before saving.");
}
export async function requireActor(request?: Request) {
  if (request) requireSameOrigin(request);
  const actor = await getActor();
  if (!actor) throw new AppError(401, "Sign in to keep your prompts and progress.");
  return actor;
}
export async function readBody(request: Request) {
  const text = await request.text();
  if (text.length > 80000) throw new AppError(413, "That content is too long. Shorten it and try again.");
  try { return JSON.parse(text); } catch { throw new AppError(400, "Could not read the form. Try again."); }
}
export function apiError(error: unknown) {
  if (error instanceof AppError) return Response.json({ error: error.message }, { status: error.status, headers: privateHeaders });
  console.error("Request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({ error: "Could not save that change. Your text is still here; try again." }, { status: 503, headers: privateHeaders });
}
