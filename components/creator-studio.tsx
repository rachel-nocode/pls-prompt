"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";

type RecordData = { id: string; title: string; version: number; slug: string; [key: string]: unknown };
type StudioData = { prompts: RecordData[] };
const empty = { title: "", summary: "", body: "", tags: "", category: "Projects", status: "draft", accessMode: "free" };
const str = (value: unknown) => typeof value === "string" ? value : "";

export function CreatorStudio({ initial }: { initial: StudioData }) {
  const [data, setData] = useState(initial); const kind = "prompt";
  const [selected, setSelected] = useState<string | null>(null); const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const records = data.prompts;
  const record = records.find(item => item.id === selected);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    const navigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!dirty || !link || link.target === "_blank" || link.hasAttribute("download") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation(); setError("Save your changes or discard them before leaving this page.");
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", navigate, true); };
  }, [dirty]);
  function load(item?: RecordData) {
    if (busy) return;
    if (dirty) { setError("Save your changes or discard them before switching."); return; }
    setSelected(item?.id ?? null); setError(""); setMessage("");
    if (!item) { setForm({ ...empty }); return; }
    setForm({ title: item.title, summary: str(item.promise), body: str(item.prompt_text), tags: (JSON.parse(str(item.tags) || "[]") as string[]).join(", "), category: str(item.category) || "Projects", status: str(item.status), accessMode: str(item.access_mode) || "free" });
  }
  function edit(key: keyof typeof empty, value: string) { setForm(current => ({ ...current, [key]: value })); setDirty(true); setMessage(""); }
  async function save() {
    setBusy(true); setError(""); setMessage("");
    const input = { title: form.title, promise: form.summary, promptText: form.body, category: form.category, tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean), status: form.status, accessMode: form.accessMode };
    try { const response = await fetch("/api/studio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id: selected, version: record?.version ?? 0, input }) }); const body = await response.json() as { error?: string; studio: StudioData; id: string }; if (!response.ok) throw new Error(body.error); setData(body.studio); setSelected(body.id); setDirty(false); setMessage(form.status === "published" ? "Published. Your changes are now available." : "Draft saved."); }
    catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="work-page"><div className="work-heading"><div><span className="mono-label">CREATOR WORKSPACE</span><h1>Original content.</h1><p>Manage earlier prompts.</p></div><Button onClick={() => load()}>New recipe</Button></div>
    {error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="form-success">{message}</p>}
    <div className="studio-layout"><aside className="studio-list">{records.map(item => <button className={"library-entry " + (selected === item.id ? "selected" : "")} key={item.id} onClick={() => load(item)}><span className="mono-label">{str(item.status)}</span><strong>{item.title}</strong><small>Version {item.version}</small></button>)}</aside>
      <form className="studio-editor" onSubmit={event => { event.preventDefault(); void save(); }}>
        <fieldset disabled={busy} className="editor-fields"><div className="editor-topline"><span className="mono-label">{selected ? "EDIT " : "NEW "}{kind.toUpperCase()}</span><span>{dirty ? "Unsaved changes" : selected ? "Saved" : "New draft"}</span></div>
        <label className="field-label" htmlFor="studio-title">Title</label><Input id="studio-title" required maxLength={140} value={form.title} onChange={event => edit("title", event.target.value)} />
        <label className="field-label" htmlFor="studio-summary">What will this recipe build?</label><Input id="studio-summary" maxLength={280} value={form.summary} onChange={event => edit("summary", event.target.value)} />
        <label className="field-label" htmlFor="studio-body">Complete, copy-ready recipe</label><Textarea id="studio-body" className="recipe-textarea" maxLength={30000} value={form.body} onChange={event => edit("body", event.target.value)} />
        <p className="field-help">Include the outcome, features, design, data, and checks. Give readers useful defaults so they can paste it straight into their builder.</p>
        <><div className="form-grid"><label>Category<Input value={form.category} onChange={event => edit("category", event.target.value)} /></label><label>Access<NativeSelect value={form.accessMode} onChange={event => edit("accessMode", event.target.value)}><option value="free">Free to collect</option><option value="earned">Previously granted access</option></NativeSelect></label></div><label className="field-label" htmlFor="studio-tags">Tags, separated by commas</label><Input id="studio-tags" value={form.tags} onChange={event => edit("tags", event.target.value)} />{record?.asset_key ? <a className="text-arrow" href={"/assets/" + str(record.asset_key)}>Review attachment →</a> : null}{record?.github_url ? <a className="text-arrow" href={str(record.github_url)} target="_blank" rel="noreferrer">Review source →</a> : null}</>
        <details className="reward-preview"><summary>Preview text</summary><h2>{form.title || "Untitled"}</h2><p>{form.summary}</p><pre>{form.body}</pre></details>
        <div className="editor-footer"><label>Status<NativeSelect value={form.status} onChange={event => edit("status", event.target.value)}><option value="draft">Draft</option>{kind === "prompt" && <option value="review">In review</option>}<option value="published">Published</option></NativeSelect></label><Button disabled={busy || !form.title.trim()}>{busy ? "Saving…" : form.status === "published" ? "Save & publish" : "Save draft"}</Button>{dirty && <Button type="button" variant="ghost" onClick={() => { setDirty(false); setError(""); setMessage("Changes discarded. Select a record to reload its saved version."); setSelected(null); setForm({ ...empty }); }}>Discard changes</Button>}</div>
      </fieldset></form>
    </div>
  </section>;
}
