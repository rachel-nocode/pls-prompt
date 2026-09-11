import { AppError } from "./repository";

export const privateHeaders = { "Cache-Control": "private, no-store" };
export function apiError(error: unknown) {
  if (error instanceof AppError) return Response.json({ error: error.message }, { status: error.status, headers: privateHeaders });
  console.error("Request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({ error: "Content is temporarily unavailable. Try again." }, { status: 503, headers: privateHeaders });
}
