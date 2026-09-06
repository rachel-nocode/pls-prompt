"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exerciseRules, type PromptExercise } from "@/lib/exercise-types";

type RecordData = { id: string; title: string; version: number; slug: string; [key: string]: unknown };
type StudioData = { prompts: RecordData[]; lessons: RecordData[] };
const emptyCheck: PromptExercise = { kind: "prompt-completion", goal: "", prefix: "", suffix: "", placeholder: "Finish the prompt in your own words…", hints: [], criteria: [{ id: "criterion-1", label: "", rule: "project-progress", hint: "" }], referenceAnswer: "", explanation: "" };
function readCheck(value: unknown): PromptExercise {
  try { const parsed = JSON.parse(str(value)); if (parsed.kind === "prompt-completion") return parsed; } catch { /* Start an empty exercise for old lessons. */ }
  return structuredClone(emptyCheck);
}
const empty = { title: "", summary: "", body: "", tags: "", category: "Projects", status: "draft", accessMode: "earned", minutes: 3, position: 4, prerequisiteId: "", rewardPromptId: "", check: emptyCheck };
const str = (value: unknown) => typeof value === "string" ? value : "";

export function CreatorStudio({ initial }: { initial: StudioData }) {
  const [data, setData] = useState(initial); const [kind, setKind] = useState<"prompt" | "lesson">("prompt");
  const [selected, setSelected] = useState<string | null>(null); const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const records = kind === "prompt" ? data.prompts : data.lessons;
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
  function load(item?: RecordData, nextKind = kind) {
    if (busy) return;
    if (dirty) { setError("Save your changes or discard them before switching."); return; }
    setKind(nextKind); setSelected(item?.id ?? null); setError(""); setMessage("");
    if (!item) { setForm({ ...empty, check: structuredClone(emptyCheck) }); return; }
    setForm({ title: item.title, summary: str(nextKind === "prompt" ? item.promise : item.summary), body: str(nextKind === "prompt" ? item.prompt_text : item.body), tags: nextKind === "prompt" ? (JSON.parse(str(item.tags) || "[]") as string[]).join(", ") : "", category: str(item.category) || "Projects", status: nextKind === "prompt" ? str(item.status) : item.published ? "published" : "draft", accessMode: str(item.access_mode) || "free", minutes: Number(item.minutes) || 3, position: Number(item.position) || 1, prerequisiteId: str(item.prerequisite_id), rewardPromptId: str(item.reward_prompt_id), check: nextKind === "lesson" ? readCheck(item.check_data) : structuredClone(emptyCheck) });
  }
  function edit(key: keyof typeof empty, value: string | number | PromptExercise) { setForm(current => ({ ...current, [key]: value })); setDirty(true); setMessage(""); }
  async function save() {
    setBusy(true); setError(""); setMessage("");
    const input = kind === "prompt" ? { title: form.title, promise: form.summary, promptText: form.body, category: form.category, tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean), status: form.status, accessMode: form.accessMode } : { title: form.title, summary: form.summary, body: form.body, minutes: form.minutes, position: form.position, prerequisiteId: form.prerequisiteId || null, rewardPromptId: form.rewardPromptId || null, published: form.status === "published", check: { ...form.check, hints: form.check.hints.map(hint => hint.trim()).filter(Boolean) } };
    try { const response = await fetch("/api/studio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id: selected, version: record?.version ?? 0, input }) }); const body = await response.json() as { error?: string; studio: StudioData; id: string }; if (!response.ok) throw new Error(body.error); setData(body.studio); setSelected(body.id); setDirty(false); setMessage(form.status === "published" ? "Published. Your changes are now available." : "Draft saved."); }
    catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="work-page"><div className="work-heading"><div><span className="mono-label">CREATOR WORKSPACE</span><h1>Original content.</h1><p>Manage earlier prompts and archived lessons.</p></div><Button onClick={() => load()}>New {kind === "prompt" ? "recipe" : "lesson"}</Button></div>
    <Tabs value={kind} onValueChange={value => load(undefined, value as "prompt" | "lesson")}><TabsList><TabsTrigger value="prompt">Prompts & review</TabsTrigger><TabsTrigger value="lesson">Lessons</TabsTrigger></TabsList></Tabs>
    {error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="form-success">{message}</p>}
    <div className="studio-layout"><aside className="studio-list">{records.map(item => <button className={"library-entry " + (selected === item.id ? "selected" : "")} key={item.id} onClick={() => load(item)}><span className="mono-label">{kind === "prompt" ? str(item.status) : item.published ? "PUBLISHED" : "DRAFT"}</span><strong>{item.title}</strong><small>Version {item.version}</small></button>)}</aside>
      <form className="studio-editor" onSubmit={event => { event.preventDefault(); void save(); }}>
        <fieldset disabled={busy} className="editor-fields"><div className="editor-topline"><span className="mono-label">{selected ? "EDIT " : "NEW "}{kind.toUpperCase()}</span><span>{dirty ? "Unsaved changes" : selected ? "Saved" : "New draft"}</span></div>
        <label className="field-label" htmlFor="studio-title">Title</label><Input id="studio-title" required maxLength={140} value={form.title} onChange={event => edit("title", event.target.value)} />
        <label className="field-label" htmlFor="studio-summary">{kind === "prompt" ? "What will this recipe build?" : "One-sentence takeaway"}</label><Input id="studio-summary" maxLength={280} value={form.summary} onChange={event => edit("summary", event.target.value)} />
        <label className="field-label" htmlFor="studio-body">{kind === "prompt" ? "Complete, copy-ready recipe" : "Lesson text · leave a blank line between steps"}</label><Textarea id="studio-body" className={kind === "prompt" ? "recipe-textarea" : "lesson-author-text"} maxLength={kind === "prompt" ? 30000 : 1800} value={form.body} onChange={event => edit("body", event.target.value)} />
        <p className="field-help">{kind === "prompt" ? "Include the outcome, features, design, data, and checks. Give learners useful defaults so they can paste it straight into their builder." : "Aim for three short steps and one prompt-completion exercise. Explain one idea in plain language."}</p>
        {kind === "prompt" ? <><div className="form-grid"><label>Category<Input value={form.category} onChange={event => edit("category", event.target.value)} /></label><label>Access<NativeSelect value={form.accessMode} onChange={event => edit("accessMode", event.target.value)}><option value="free">Free to collect</option><option value="earned">Lesson reward</option></NativeSelect></label></div><label className="field-label" htmlFor="studio-tags">Tags, separated by commas</label><Input id="studio-tags" value={form.tags} onChange={event => edit("tags", event.target.value)} />{record?.asset_key ? <a className="text-arrow" href={"/assets/" + str(record.asset_key)}>Review attachment →</a> : null}{record?.github_url ? <a className="text-arrow" href={str(record.github_url)} target="_blank" rel="noreferrer">Review source →</a> : null}</>
        : <><div className="form-grid"><label>Minutes<Input type="number" min={1} max={5} value={form.minutes} onChange={event => edit("minutes", Number(event.target.value))} /></label><label>Order<Input type="number" min={1} max={100} value={form.position} onChange={event => edit("position", Number(event.target.value))} /></label><label>Previous lesson<NativeSelect value={form.prerequisiteId} onChange={event => edit("prerequisiteId", event.target.value)}><option value="">Start of path</option>{data.lessons.filter(item => item.id !== selected).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</NativeSelect></label><label>Completion reward<NativeSelect value={form.rewardPromptId} onChange={event => edit("rewardPromptId", event.target.value)}><option value="">Choose a recipe</option>{data.prompts.filter(item => item.status === "published" && item.prompt_text).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</NativeSelect></label></div>
          <fieldset className="author-check"><legend>Prompt-completion exercise</legend>
            <p className="field-help">Give learners a starter and a clear goal. Guided checks look for specific instructions in the part they write.</p>
            <label>Goal<Input maxLength={350} value={form.check.goal} onChange={event => edit("check", { ...form.check, goal: event.target.value })} /></label>
            <label>Prompt starter<Textarea maxLength={700} value={form.check.prefix} onChange={event => edit("check", { ...form.check, prefix: event.target.value })} /></label>
            <label>Prompt ending (optional)<Textarea maxLength={350} value={form.check.suffix} onChange={event => edit("check", { ...form.check, suffix: event.target.value })} /></label>
            <label>Blank placeholder<Input maxLength={180} value={form.check.placeholder} onChange={event => edit("check", { ...form.check, placeholder: event.target.value })} /></label>
            <label>Hints (one per line, up to four)<Textarea maxLength={1003} value={form.check.hints.join("\n")} onChange={event => edit("check", { ...form.check, hints: event.target.value.split("\n") })} /></label>
            {form.check.criteria.map((criterion, index) => <div className="author-criterion" key={criterion.id}>
              <label>Check {index + 1}<NativeSelect value={criterion.rule} onChange={event => edit("check", { ...form.check, criteria: form.check.criteria.map((current, i) => i === index ? { ...current, rule: event.target.value as typeof criterion.rule } : current) })}>{exerciseRules.map(rule => <option key={rule.id} value={rule.id}>{rule.label}</option>)}</NativeSelect></label>
              <label>Learner-facing checklist label<Input maxLength={180} value={criterion.label} onChange={event => edit("check", { ...form.check, criteria: form.check.criteria.map((current, i) => i === index ? { ...current, label: event.target.value } : current) })} /></label>
              <label>Feedback when this is missing<Input maxLength={250} value={criterion.hint} onChange={event => edit("check", { ...form.check, criteria: form.check.criteria.map((current, i) => i === index ? { ...current, hint: event.target.value } : current) })} /></label>
              {form.check.criteria.length > 1 && <Button type="button" variant="ghost" onClick={() => edit("check", { ...form.check, criteria: form.check.criteria.filter((_, i) => i !== index) })}>Remove check {index + 1}</Button>}
            </div>)}
            {form.check.criteria.length < 4 && <Button type="button" variant="outline" onClick={() => { const rule = exerciseRules.find(rule => !form.check.criteria.some(criterion => criterion.rule === rule.id))!; edit("check", { ...form.check, criteria: [...form.check.criteria, { id: crypto.randomUUID(), label: rule.label, rule: rule.id, hint: "" }] }); }}>Add a check</Button>}
            <label>Reference answer (private)<Textarea maxLength={2000} value={form.check.referenceAnswer} onChange={event => edit("check", { ...form.check, referenceAnswer: event.target.value })} /></label>
            <p className="field-help">Write only the missing part. It must pass every check before you can publish.</p>
            <label>Feedback when all checks pass<Textarea maxLength={600} value={form.check.explanation} onChange={event => edit("check", { ...form.check, explanation: event.target.value })} /></label>
          </fieldset></>}
        <details className="reward-preview"><summary>Preview text</summary><h2>{form.title || "Untitled"}</h2><p>{form.summary}</p><pre>{form.body}</pre>{kind === "lesson" && <><h3>{form.check.goal}</h3><pre>{[form.check.prefix, "[Learner writes here]", form.check.suffix].filter(Boolean).join("\n\n")}</pre></>}</details>
        <div className="editor-footer"><label>Status<NativeSelect value={form.status} onChange={event => edit("status", event.target.value)}><option value="draft">Draft</option>{kind === "prompt" && <option value="review">In review</option>}<option value="published">Published</option></NativeSelect></label><Button disabled={busy || !form.title.trim()}>{busy ? "Saving…" : form.status === "published" ? "Save & publish" : "Save draft"}</Button>{dirty && <Button type="button" variant="ghost" onClick={() => { setDirty(false); setError(""); setMessage("Changes discarded. Select a record to reload its saved version."); setSelected(null); setForm({ ...empty, check: structuredClone(emptyCheck) }); }}>Discard changes</Button>}</div>
      </fieldset></form>
    </div>
  </section>;
}
