import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import type { Actor } from "./library-types";

export async function getActor(): Promise<Actor | null> {
  const user = await getChatGPTUser();
  if (!user) return null;
  const configured = (env as unknown as { PLS_CREATOR_EMAILS?: string }).PLS_CREATOR_EMAILS ?? "";
  const allowed = configured.split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return { id: user.id, displayName: user.displayName, isCreator: allowed.includes(user.email.toLowerCase()) };
}
