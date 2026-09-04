"use client";
import { useState } from "react";
import { GitFork, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SubmitForm() {
  const [category, setCategory] = useState("Code");
  const [busy, setBusy] = useState(false);
  const [assetKey, setAssetKey] = useState<string | null>(null);

  async function upload(file: File) {
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: data });
    const result = await response.json() as { assetKey?: string; error?: string };
    if (!response.ok || !result.assetKey) throw new Error(result.error || "Upload failed");
    setAssetKey(result.assetKey);
    toast.success("Attachment stored safely.");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      title: String(form.get("title") || ""),
      promise: String(form.get("promise") || ""),
      promptText: String(form.get("promptText") || ""),
      githubUrl: String(form.get("githubUrl") || ""),
      category,
      models: String(form.get("models") || "").split(",").map((item) => item.trim()).filter(Boolean),
      assetKey,
    };
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Submission failed");
      formElement.reset();
      setAssetKey(null);
      toast.success("Prompt submitted for human review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="submit-form" onSubmit={submit}>
      <div className="field-grid">
        <label><span>Prompt title</span><Input name="title" required placeholder="What does this prompt help someone do?" /></label>
        <label><span>Category</span>
          <Select value={category} onValueChange={(value) => value && setCategory(value)}>
            <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
            <SelectContent>{["Code", "Research", "Writing", "Marketing", "Design", "Productivity"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </label>
      </div>
      <label><span>One-sentence promise</span><Input name="promise" required placeholder="The useful result someone should expect" /></label>
      <label><span>Prompt text</span><Textarea name="promptText" rows={11} placeholder="Paste the prompt here, or use a GitHub link below." /></label>
      <div className="or-divider"><span>OR LINK THE SOURCE</span></div>
      <label><span><GitFork aria-hidden="true" /> GitHub URL</span><Input name="githubUrl" type="url" placeholder="https://github.com/you/repo/blob/main/prompt.md" /></label>
      <label><span>Models tested</span><Input name="models" placeholder="ChatGPT, Claude, Gemini" /></label>
      <label className="file-field">
        <span><Paperclip aria-hidden="true" /> Optional attachment</span>
        <Input type="file" accept=".md,.txt,.json,.pdf" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file).catch((error) => toast.error(error.message));
        }} />
        <small>{assetKey ? "Stored. It will be linked to this submission." : "Markdown, text, JSON, or PDF. Maximum 2 MB."}</small>
      </label>
      <Button type="submit" className="submit-main" disabled={busy}><Send aria-hidden="true" /> {busy ? "Submitting..." : "Submit for review"}</Button>
    </form>
  );
}
