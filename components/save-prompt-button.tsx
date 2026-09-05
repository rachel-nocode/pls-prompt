"use client";
import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SavePromptButton({ promptId, signIn }: { promptId: string; signIn: string | null }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [itemId, setItemId] = useState<string | null>(null);
  if (signIn) return <Button variant="outline" asChild><a href={signIn} target="_top"><Bookmark /> Sign in to save</a></Button>;
  if (itemId) return <Button variant="outline" asChild><Link href={`/library?item=${encodeURIComponent(itemId)}`}>Saved · Open in library</Link></Button>;
  return <div><Button variant="outline" disabled={busy} onClick={async () => { setBusy(true); setError(""); try { const response = await fetch("/api/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", promptId }) }); const data = await response.json() as { error?: string; result: { id: string } }; if (!response.ok) throw new Error(data.error); setItemId(data.result.id); } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); } finally { setBusy(false); } }}><Bookmark />{busy ? "Saving…" : "Save to library"}</Button>{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
