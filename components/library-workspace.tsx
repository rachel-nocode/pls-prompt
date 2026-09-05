"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, BookOpen, Download, FolderPlus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";
import type { LibraryData, LibraryItem, LibraryVersion } from "@/lib/library-types";

const blank = { title: "", promptText: "", notes: "", tags: "" };
function fields(item: LibraryItem) { return { title: item.title, promptText: item.prompt_text, notes: item.notes, tags: (JSON.parse(item.tags) as string[]).join(", ") }; }
export function LibraryWorkspace({ initial, initialItemId }: { initial: LibraryData; initialItemId?: string }) {
  const [data, setData] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initialItemId && initial.items.some(item => item.id === initialItemId) ? initialItemId : null);
  const first = initial.items.find(item => item.id === initialItemId);
  const [form, setForm] = useState(first ? fields(first) : blank);
  const [editing, setEditing] = useState(Boolean(first));
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<string | null | undefined>();
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("all");
  const [collectionTitle, setCollectionTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const [history, setHistory] = useState<LibraryVersion[]>([]);
  const [activeTab, setActiveTab] = useState("recipe");
  const item = data.items.find(value => value.id === selected);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    const navigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!dirty || !link || link.target === "_blank" || link.hasAttribute("download") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation(); setError("Save your changes or discard them before leaving this page."); setPending(selected);
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", navigate, true); };
  }, [dirty, selected]);
  const items = data.items.filter(item => {
    const matchesText = `${item.title} ${item.prompt_text} ${item.tags} ${item.notes}`.toLowerCase().includes(query.toLowerCase());
    const matchesGroup = filter === "archive" ? Boolean(item.archived_at) : !item.archived_at && (filter === "all" || (filter === "earned" ? item.source === "earned" : data.memberships.some(link => link.item_id === item.id && link.collection_id === filter)));
    return matchesText && matchesGroup;
  });
  function choose(id: string | null, force = false) {
    if (busy) return;
    if (dirty && !force) { setPending(id); return; }
    const next = data.items.find(item => item.id === id);
    setSelected(id); setForm(next ? fields(next) : blank); setDirty(false); setEditing(true); setHistory([]); setPending(undefined); setMessage(""); setError(""); setActiveTab("recipe");
  }
  function change(key: keyof typeof blank, value: string) { setForm(current => ({ ...current, [key]: value })); setDirty(true); setMessage(""); }
  async function mutate(payload: unknown) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json() as { error?: string; library: LibraryData; result?: LibraryItem };
      if (!response.ok) throw new Error(body.error);
      setData(body.library); return body;
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); return undefined; }
    finally { setBusy(false); }
  }
  async function save() {
    const input = { ...form, tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean) };
    const response = await mutate(item ? { action: "update", id: item.id, version: item.version, input } : { action: "create", input });
    const result = response?.result;
    if (result) { setSelected(result.id); setForm(fields(result)); setDirty(false); setMessage("Saved to your library."); setHistory([]); }
  }
  async function showHistory() {
    setActiveTab("history"); if (!item) return;
    try {
      const response = await fetch(`/api/library?history=${encodeURIComponent(item.id)}`); const body = await response.json() as { error?: string; versions: LibraryVersion[] };
      if (!response.ok) throw new Error(body.error); setHistory(body.versions);
    } catch (error) { setError(error instanceof Error ? error.message : "History is unavailable."); }
  }
  function download() {
    const text = `# ${form.title}\n\n${form.promptText}\n${form.notes ? `\n## My notes\n${form.notes}\n` : ""}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    const a = document.createElement("a"); a.href = url; a.download = `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "prompt"}.md`; a.click(); URL.revokeObjectURL(url);
  }
  return <section className="work-page">
    <div className="work-heading"><div><span className="mono-label">YOUR COLLECTION</span><h1>My library</h1><p>Project recipes, personal prompts, and your own improvements.</p></div><div className="action-row"><Button variant="outline" asChild><a href="/api/library?export=json"><Download /> Export library</a></Button><Button onClick={() => choose(null)}><Plus /> New prompt</Button></div></div>
    <div className="library-layout">
      <aside className="library-nav" aria-label="Library collections">
        <Button variant={filter === "all" ? "secondary" : "ghost"} onClick={() => { setFilter("all"); setRenaming(false); }}>All prompts <span>{data.items.filter(item => !item.archived_at).length}</span></Button>
        <Button variant={filter === "earned" ? "secondary" : "ghost"} onClick={() => { setFilter("earned"); setRenaming(false); }}><BookOpen /> Lesson rewards</Button>
        <p className="mono-label">Collections</p>
        {data.collections.map(collection => <Button key={collection.id} variant={filter === collection.id ? "secondary" : "ghost"} onClick={() => { setFilter(collection.id); setCollectionTitle(collection.title); setRenaming(true); }}>{collection.title}</Button>)}
        <form className="collection-form" onSubmit={async event => { event.preventDefault(); const result = await mutate(renaming ? { action: "renameCollection", id: filter, title: collectionTitle } : { action: "createCollection", title: collectionTitle }); if (result) { setCollectionTitle(""); setRenaming(false); } }}>
          <label htmlFor="collection-name">{renaming ? "Rename collection" : "New collection"}</label><Input id="collection-name" maxLength={80} required value={collectionTitle} onChange={event => setCollectionTitle(event.target.value)} placeholder="Project ideas" />
          <Button variant="outline" disabled={busy || !collectionTitle.trim()}><FolderPlus /> {renaming ? "Rename" : "Add collection"}</Button>
          {renaming && <Button type="button" variant="ghost" onClick={() => { setRenaming(false); setCollectionTitle(""); }}>New collection instead</Button>}
        </form>
        <Button variant={filter === "archive" ? "secondary" : "ghost"} onClick={() => { setFilter("archive"); setRenaming(false); }}><Archive /> Archive</Button>
        <Link className="text-arrow" href="/learn">Earn your next recipe →</Link>
      </aside>
      <div className="library-list"><label className="search-compact"><Search /><Input aria-label="Search your library" placeholder="Search titles, tags, or notes" value={query} onChange={event => setQuery(event.target.value)} /></label>
        {items.map(entry => <button type="button" className={`library-entry ${selected === entry.id ? "selected" : ""}`} key={entry.id} onClick={() => choose(entry.id)}><span className="mono-label">{entry.source === "earned" ? "LESSON REWARD" : entry.source === "saved" ? "SAVED PROMPT" : "YOUR PROMPT"}</span><strong>{entry.title}</strong><small>Version {entry.version}{entry.archived_at ? " · Archived" : ""}</small></button>)}
        {!items.length && <div className="compact-empty"><h2>{query ? "No matches" : "Room for your next idea"}</h2><p>{query ? "Try a different word or collection." : "Add a prompt or finish a short lesson to collect your first project recipe."}</p><Button asChild variant="outline"><Link href="/learn">Explore lessons</Link></Button></div>}
      </div>
      <div className="library-editor" aria-busy={busy}>
        {pending !== undefined && <div className="form-notice" role="alert">You have unsaved changes.<div className="action-row"><Button onClick={save} disabled={busy || !form.title.trim()}>Save changes</Button><Button variant="outline" onClick={() => choose(pending, true)}>Discard and continue</Button><Button variant="ghost" onClick={() => setPending(undefined)}>Keep editing</Button></div></div>}
        {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
        {editing ? <fieldset disabled={busy} className="editor-fields"><div className="editor-topline"><span className="mono-label">{item ? `VERSION ${item.version} / PRIVATE COPY` : "NEW / PRIVATE PROMPT"}</span><span role="status">{dirty ? "Unsaved changes" : item ? "Saved" : "New draft"}</span></div>
          <label className="field-label" htmlFor="item-title">Title</label><Input id="item-title" maxLength={140} value={form.title} onChange={event => change("title", event.target.value)} placeholder="Name your prompt" />
          <Tabs value={activeTab} onValueChange={value => { if (value === "history") void showHistory(); else setActiveTab(value); }}><TabsList><TabsTrigger value="recipe">Prompt</TabsTrigger><TabsTrigger value="notes">Notes & collections</TabsTrigger><TabsTrigger value="history" disabled={!item}>History</TabsTrigger></TabsList>
            <TabsContent value="recipe"><label className="field-label" htmlFor="item-prompt">Copy-ready instructions</label><Textarea id="item-prompt" className="recipe-textarea" maxLength={30000} value={form.promptText} onChange={event => change("promptText", event.target.value)} placeholder="Write or paste your prompt here…" />{item?.source_url && <a className="text-arrow" href={item.source_url} target="_blank" rel="noreferrer">Open original source →</a>}<p className="field-help">Paste the full recipe into your AI builder. Edits here stay in your private copy.</p><div className="action-row"><CopyButton text={form.promptText} /><Button variant="outline" onClick={download}><Download /> Download .md</Button></div></TabsContent>
            <TabsContent value="notes"><label className="field-label" htmlFor="item-notes">My notes</label><Textarea id="item-notes" rows={7} maxLength={6000} value={form.notes} onChange={event => change("notes", event.target.value)} placeholder="What worked? What would you change?" /><label className="field-label" htmlFor="item-tags">Tags, separated by commas</label><Input id="item-tags" value={form.tags} onChange={event => change("tags", event.target.value)} placeholder="web app, client work" />{item && <fieldset className="collection-checks"><legend>Collections</legend>{data.collections.map(collection => <label key={collection.id}><Checkbox disabled={busy} checked={data.memberships.some(link => link.collection_id === collection.id && link.item_id === item.id)} onCheckedChange={checked => void mutate({ action: "setCollection", collectionId: collection.id, itemId: item.id, included: checked === true })} />{collection.title}</label>)}{!data.collections.length && <p>Create a collection on the left to organize this prompt.</p>}</fieldset>}</TabsContent>
            <TabsContent value="history"><p className="field-help">Restoring creates a new version. Earlier versions stay available.</p>{history.map(version => { const saved = JSON.parse(version.snapshot); return <div className="version-entry" key={version.id}><strong>Version {version.version} · {saved.title}</strong><small>{new Date(version.created_at).toLocaleString()}</small><details><summary>Read this version</summary><pre>{saved.promptText}</pre></details><Button variant="outline" disabled={busy || dirty || version.version === item?.version} onClick={async () => { if (!item) return; const response = await mutate({ action: "restoreVersion", id: item.id, version: version.version, expectedVersion: item.version }); const result = response?.result; if (result) { setForm(fields(result)); setMessage("Version restored as a new copy."); setHistory([]); setActiveTab("recipe"); } }}>Restore version</Button></div>; })}</TabsContent>
          </Tabs>
          <div className="editor-footer"><Button onClick={save} disabled={busy || !form.title.trim() || (!dirty && Boolean(item))}>{busy ? "Saving…" : "Save prompt"}</Button>{item && <Button variant="ghost" disabled={busy || dirty} onClick={() => void mutate({ action: "archive", id: item.id, archived: !item.archived_at })}>{item.archived_at ? "Restore from archive" : "Move to archive"}</Button>}</div>
        </fieldset> : <div className="editor-welcome"><BookOpen /><h2>A useful collection,<br />built by you.</h2><p>Choose a recipe to copy, customize, or collect in a folder.</p><Button onClick={() => choose(null)}><Plus /> Add your own prompt</Button></div>}
      </div>
    </div>
  </section>;
}
