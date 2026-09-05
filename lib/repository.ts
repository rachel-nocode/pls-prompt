import type { Actor, ItemInput, LibraryItem, LibraryData, PublicLesson, PromptSummary, QuickCheck } from "./library-types";
import type { PromptRecord } from "./content";

export interface SqlStatement {
  bind(...values: unknown[]): SqlStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  run(): Promise<{ meta?: { changes?: number } }>;
}
export interface SqlDatabase {
  prepare(sql: string): SqlStatement;
  batch(statements: SqlStatement[]): Promise<{ meta?: { changes?: number } }[]>;
}
export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
type Prompt = PromptRecord & { access_mode: string; version: number };
type Lesson = Record<string, unknown> & { id: string; slug: string; title: string; body: string; check_data: string; reward_prompt_id: string | null; prerequisite_id: string | null; version: number; published: number };
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const safeJson = <T>(text: string, fallback: T): T => { try { return JSON.parse(text) as T; } catch { return fallback; } };
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "untitled";
export const itemSnapshot = (item: LibraryItem) => JSON.stringify({ title: item.title, promptText: item.prompt_text, notes: item.notes, tags: safeJson(item.tags, []) });

export function createRepository(db: SqlDatabase) {
  const q = (sql: string, ...values: unknown[]) => db.prepare(sql).bind(...values);
  const rows = async <T>(sql: string, ...values: unknown[]) => (await q(sql, ...values).all<T>()).results ?? [];
  const owned = async (actor: Actor, id: string) => {
    const item = await q("SELECT * FROM library_items WHERE id=? AND user_id=?", id, actor.id).first<LibraryItem>();
    if (!item) throw new AppError(404, "That library item is unavailable.");
    return item;
  };
  const canAccess = async (actor: Actor | null, prompt: Prompt) => {
    if (actor?.isCreator) return true;
    if (prompt.status !== "published") return false;
    if (prompt.access_mode === "free") return true;
    return Boolean(actor && await q("SELECT id FROM prompt_access WHERE user_id=? AND prompt_id=? LIMIT 1", actor.id, prompt.id).first());
  };
  const versionStatement = (item: LibraryItem) => q(
    "INSERT OR IGNORE INTO library_versions(id,item_id,user_id,version,snapshot,created_at) VALUES (?,?,?,?,?,?)",
    uid(), item.id, item.user_id, item.version, itemSnapshot(item), now(),
  );
  const itemInsert = (id: string, actor: Actor, prompt: Prompt, source: string, time: string) => q(
    "INSERT OR IGNORE INTO library_items(id,user_id,prompt_id,title,prompt_text,source_url,tags,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    id, actor.id, prompt.id, prompt.title, prompt.prompt_text ?? "", prompt.github_url ?? (prompt.asset_key ? "/assets/" + prompt.asset_key : null), prompt.tags, source, time, time,
  );
  const requireCreator = (actor: Actor) => { if (!actor.isCreator) throw new AppError(403, "Creator access is required."); };

  const api = {
    async listPrompts() {
      return rows<PromptSummary>("SELECT id,slug,title,promise,category,tags,difficulty,models,verified,quality_score,tested_at,access_mode,version FROM prompts WHERE status='published' ORDER BY verified DESC,quality_score DESC,created_at DESC");
    },
    async promptBySlug(slug: string, actor: Actor | null) {
      const prompt = await q("SELECT * FROM prompts WHERE slug=? AND status='published'", slug).first<Prompt>();
      if (!prompt) return null;
      const accessible = await canAccess(actor, prompt);
      const lesson = await q("SELECT slug,title FROM lessons WHERE reward_prompt_id=? AND published=1 ORDER BY position LIMIT 1", prompt.id).first<{ slug: string; title: string }>();
      return { ...prompt, prompt_text: accessible ? prompt.prompt_text : null, github_url: accessible ? prompt.github_url : null, asset_key: accessible ? prompt.asset_key : null, accessible, lesson };
    },
    async canReadAsset(key: string, actor: Actor | null) {
      const prompts = await rows<Prompt>("SELECT * FROM prompts WHERE asset_key=?", key);
      for (const prompt of prompts) {
        if (prompt.author_id === actor?.id || await canAccess(actor, prompt)) return true;
      }
      return false;
    },
    async library(actor: Actor): Promise<LibraryData> {
      const [items, collections, memberships] = await Promise.all([
        rows<LibraryItem>("SELECT * FROM library_items WHERE user_id=? ORDER BY updated_at DESC,id", actor.id),
        rows<LibraryData["collections"][number]>("SELECT * FROM collections WHERE user_id=? ORDER BY created_at,id", actor.id),
        rows<LibraryData["memberships"][number]>("SELECT ci.collection_id,ci.item_id FROM collection_items ci JOIN collections c ON c.id=ci.collection_id JOIN library_items i ON i.id=ci.item_id WHERE c.user_id=? AND i.user_id=?", actor.id, actor.id),
      ]);
      return { items, collections, memberships };
    },
    async exportLibrary(actor: Actor) {
      const library = await api.library(actor);
      const versions = await rows("SELECT v.* FROM library_versions v JOIN library_items i ON i.id=v.item_id WHERE v.user_id=? AND i.user_id=? ORDER BY v.item_id,v.version", actor.id, actor.id);
      return { format: "plsprompt-library-v1", exportedAt: now(), ...library, versions };
    },
    async libraryItemForPrompt(actor: Actor, promptId: string) {
      return q("SELECT * FROM library_items WHERE user_id=? AND prompt_id=?", actor.id, promptId).first<LibraryItem>();
    },
    async savePrompt(actor: Actor, promptId: string) {
      const prompt = await q("SELECT * FROM prompts WHERE id=?", promptId).first<Prompt>();
      if (!prompt || !await canAccess(actor, prompt)) throw new AppError(403, "Complete the linked lesson to collect this recipe.");
      await itemInsert(uid(), actor, prompt, prompt.access_mode === "earned" ? "earned" : "saved", now()).run();
      const item = await q("SELECT * FROM library_items WHERE user_id=? AND prompt_id=?", actor.id, prompt.id).first<LibraryItem>();
      if (!item) throw new AppError(503, "Could not save your prompt. Try again.");
      await db.batch([versionStatement(item), q("UPDATE library_items SET archived_at=NULL WHERE id=? AND user_id=?", item.id, actor.id)]);
      return { ...item, archived_at: null };
    },
    async createItem(actor: Actor, input: ItemInput) {
      const time = now();
      const item: LibraryItem = { id: uid(), user_id: actor.id, prompt_id: null, title: input.title, prompt_text: input.promptText, source_url: null, tags: JSON.stringify(input.tags), notes: input.notes, source: "personal", version: 1, archived_at: null, created_at: time, updated_at: time };
      await db.batch([
        q("INSERT INTO library_items(id,user_id,title,prompt_text,tags,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", item.id, actor.id, item.title, item.prompt_text, item.tags, item.notes, time, time),
        versionStatement(item),
      ]);
      return item;
    },
    async updateItem(actor: Actor, id: string, expectedVersion: number, input: ItemInput) {
      const item = await owned(actor, id);
      if (item.version !== expectedVersion) throw new AppError(409, "This prompt changed elsewhere. Reload before saving.");
      const next = { ...item, title: input.title, prompt_text: input.promptText, tags: JSON.stringify(input.tags), notes: input.notes, version: item.version + 1, updated_at: now() };
      const results = await db.batch([
        versionStatement(item),
        q("INSERT INTO library_versions(id,item_id,user_id,version,snapshot,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM library_items WHERE id=? AND user_id=? AND version=?)", uid(), id, actor.id, next.version, itemSnapshot(next), next.updated_at, id, actor.id, expectedVersion),
        q("UPDATE library_items SET title=?,prompt_text=?,tags=?,notes=?,version=?,updated_at=? WHERE id=? AND user_id=? AND version=?", next.title, next.prompt_text, next.tags, next.notes, next.version, next.updated_at, id, actor.id, expectedVersion),
      ]);
      if (!results[2].meta?.changes) throw new AppError(409, "This prompt changed elsewhere. Reload before saving.");
      return next;
    },
    async archiveItem(actor: Actor, id: string, archived: boolean) {
      await owned(actor, id);
      await q("UPDATE library_items SET archived_at=?,updated_at=? WHERE id=? AND user_id=?", archived ? now() : null, now(), id, actor.id).run();
    },
    async itemVersions(actor: Actor, id: string) {
      await owned(actor, id);
      return rows("SELECT * FROM library_versions WHERE item_id=? AND user_id=? ORDER BY version DESC", id, actor.id);
    },
    async restoreItem(actor: Actor, id: string, version: number, expectedVersion: number) {
      await owned(actor, id);
      const saved = await q("SELECT snapshot FROM library_versions WHERE item_id=? AND user_id=? AND version=?", id, actor.id, version).first<{ snapshot: string }>();
      if (!saved) throw new AppError(404, "That version is unavailable.");
      return api.updateItem(actor, id, expectedVersion, JSON.parse(saved.snapshot));
    },
    async createCollection(actor: Actor, title: string) {
      const collection = { id: uid(), user_id: actor.id, title, created_at: now() };
      await q("INSERT INTO collections(id,user_id,title,created_at) VALUES (?,?,?,?)", collection.id, actor.id, title, collection.created_at).run();
      return collection;
    },
    async renameCollection(actor: Actor, id: string, title: string) {
      const result = await q("UPDATE collections SET title=? WHERE id=? AND user_id=?", title, id, actor.id).run();
      if (!result.meta?.changes) throw new AppError(404, "That collection is unavailable.");
    },
    async setCollection(actor: Actor, collectionId: string, itemId: string, included: boolean) {
      await owned(actor, itemId);
      const collection = await q("SELECT id FROM collections WHERE id=? AND user_id=?", collectionId, actor.id).first();
      if (!collection) throw new AppError(404, "That collection is unavailable.");
      if (included) await q("INSERT OR IGNORE INTO collection_items(id,collection_id,item_id) SELECT ?,c.id,i.id FROM collections c JOIN library_items i ON i.id=? WHERE c.id=? AND c.user_id=? AND i.user_id=?", uid(), itemId, collectionId, actor.id, actor.id).run();
      else await q("DELETE FROM collection_items WHERE collection_id=? AND item_id=? AND EXISTS(SELECT 1 FROM collections WHERE id=? AND user_id=?)", collectionId, itemId, collectionId, actor.id).run();
    },
    async publicLessons(): Promise<PublicLesson[]> {
      const lessons = await rows<Lesson>("SELECT l.*,p.title AS reward_title,p.promise AS reward_promise FROM lessons l LEFT JOIN prompts p ON p.id=l.reward_prompt_id WHERE l.published=1 ORDER BY l.position,l.created_at");
      return lessons.map(({ check_data, ...lesson }) => {
        const check = safeJson<Partial<QuickCheck>>(check_data, {});
        return { ...lesson, question: check.question ?? "", options: check.options ?? [] } as PublicLesson;
      });
    },
    async completions(actor: Actor) {
      return rows<{ lesson_id: string; reward_prompt_id: string | null; completed_at: string }>("SELECT lesson_id,reward_prompt_id,completed_at FROM lesson_completions WHERE user_id=?", actor.id);
    },
    async completeLesson(actor: Actor, slug: string, answer: string, expectedVersion: number) {
      const lesson = await q("SELECT * FROM lessons WHERE slug=? AND published=1", slug).first<Lesson>();
      if (!lesson) throw new AppError(404, "That lesson is unavailable.");
      const prior = await q("SELECT reward_prompt_id FROM lesson_completions WHERE user_id=? AND lesson_id=?", actor.id, lesson.id).first<{ reward_prompt_id: string | null }>();
      if (prior) return { completed: true, alreadyCompleted: true, item: prior.reward_prompt_id ? await api.savePrompt(actor, prior.reward_prompt_id) : null, explanation: "Already completed. Your recipe is in your library." };
      if (lesson.version !== expectedVersion) throw new AppError(409, "This lesson has changed. Reload to see the latest check.");
      if (lesson.prerequisite_id && !await q("SELECT id FROM lesson_completions WHERE user_id=? AND lesson_id=?", actor.id, lesson.prerequisite_id).first()) throw new AppError(409, "Finish the previous lesson first.");
      const check = safeJson<Partial<QuickCheck>>(lesson.check_data, {});
      if (!check.correct || !check.options?.some(option => option.id === answer)) throw new AppError(400, "Choose one of the answers.");
      if (answer !== check.correct) return { completed: false, explanation: "Try again. Look for a clear, specific request you can check.", item: null };
      const reward = lesson.reward_prompt_id ? await q("SELECT * FROM prompts WHERE id=? AND status='published'", lesson.reward_prompt_id).first<Prompt>() : null;
      if (!reward?.prompt_text) throw new AppError(409, "This lesson's recipe is being prepared. Your progress has not been changed.");
      const time = now();
      const completionId = uid();
      const itemId = uid();
      const completionGuard = "EXISTS(SELECT 1 FROM lesson_completions WHERE user_id=? AND lesson_id=? AND reward_prompt_id=?)";
      await db.batch([
        q("INSERT OR IGNORE INTO lesson_completions(id,user_id,lesson_id,lesson_version,reward_prompt_id,completed_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM lessons WHERE id=? AND version=? AND published=1)", completionId, actor.id, lesson.id, lesson.version, reward.id, time, lesson.id, expectedVersion),
        q("INSERT OR IGNORE INTO prompt_access(id,user_id,prompt_id,source,source_id,created_at) SELECT ?,?,?,'earned',?,? WHERE " + completionGuard, uid(), actor.id, reward.id, lesson.id, time, actor.id, lesson.id, reward.id),
        q("INSERT OR IGNORE INTO library_items(id,user_id,prompt_id,title,prompt_text,source_url,tags,source,created_at,updated_at) SELECT ?,?,?,?,?,?,?,'earned',?,? WHERE " + completionGuard, itemId, actor.id, reward.id, reward.title, reward.prompt_text, reward.github_url, reward.tags, time, time, actor.id, lesson.id, reward.id),
      ]);
      const recorded = await q("SELECT reward_prompt_id FROM lesson_completions WHERE user_id=? AND lesson_id=?", actor.id, lesson.id).first<{ reward_prompt_id: string }>();
      if (recorded?.reward_prompt_id !== reward.id) throw new AppError(409, "This lesson changed while saving. Reload and try again.");
      const item = await q("SELECT * FROM library_items WHERE user_id=? AND prompt_id=?", actor.id, reward.id).first<LibraryItem>();
      if (!item) throw new AppError(409, "This lesson changed while saving. Reload and try again.");
      await db.batch([versionStatement(item), q("UPDATE library_items SET archived_at=NULL WHERE id=? AND user_id=?", item.id, actor.id)]);
      return { completed: true, alreadyCompleted: false, item: { ...item, archived_at: null }, explanation: check.explanation };
    },
    async studio(actor: Actor) {
      requireCreator(actor);
      const [prompts, lessons] = await Promise.all([rows("SELECT * FROM prompts ORDER BY updated_at DESC"), rows("SELECT * FROM lessons ORDER BY position,created_at")]);
      return { prompts, lessons };
    },
    async editPrompt(actor: Actor, id: string | null, expectedVersion: number, input: { title: string; promise: string; promptText: string; category: string; tags: string[]; status: string; accessMode: string }) {
      requireCreator(actor);
      const current = id ? await q("SELECT * FROM prompts WHERE id=?", id).first<Prompt>() : null;
      if (id && !current) throw new AppError(404, "Prompt unavailable.");
      if (current && current.version !== expectedVersion) throw new AppError(409, "This prompt changed. Reload before saving.");
      if (input.status === "published" && (!input.promise.trim() || (!input.promptText.trim() && !current?.github_url && !current?.asset_key))) throw new AppError(400, "Add a description and a complete prompt before publishing.");
      if (current?.status === "published" && current.access_mode === "free" && input.accessMode !== "free") throw new AppError(400, "Published free prompts stay free. Create a new reward recipe instead.");
      const time = now(); const recordId = id ?? uid(); const nextVersion = (current?.version ?? 0) + 1;
      if (input.status !== "published" && current && await q("SELECT id FROM lessons WHERE reward_prompt_id=? AND published=1", id).first()) throw new AppError(409, "Unpublish the linked lesson before unpublishing its recipe.");
      if (current) {
        const result = await db.batch([
          q("INSERT OR IGNORE INTO editorial_versions(id,kind,record_id,version,snapshot,editor_id,created_at) VALUES (?,'prompt',?,?,?,?,?)", uid(), recordId, current.version, JSON.stringify(current), actor.id, time),
          q("UPDATE prompts SET title=?,promise=?,prompt_text=?,category=?,tags=?,status=?,access_mode=?,version=?,updated_at=?,verified=0,tested_at=NULL WHERE id=? AND version=?", input.title, input.promise, input.promptText, input.category, JSON.stringify(input.tags), input.status, input.accessMode, nextVersion, time, recordId, expectedVersion),
        ]);
        if (!result[1].meta?.changes) throw new AppError(409, "This prompt changed. Reload before saving.");
      } else await q("INSERT INTO prompts(id,slug,title,promise,prompt_text,category,tags,author_id,author_name,status,access_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", recordId, slugify(input.title) + "-" + recordId.slice(0, 6), input.title, input.promise, input.promptText, input.category, JSON.stringify(input.tags), actor.id, actor.displayName, input.status, input.accessMode, time, time).run();
      return recordId;
    },
    async editLesson(actor: Actor, id: string | null, expectedVersion: number, input: { title: string; summary: string; body: string; minutes: number; position: number; prerequisiteId: string | null; rewardPromptId: string | null; published: boolean; check: QuickCheck }) {
      requireCreator(actor);
      const current = id ? await q("SELECT * FROM lessons WHERE id=?", id).first<Lesson>() : null;
      if (id && !current) throw new AppError(404, "Lesson unavailable.");
      if (current && current.version !== expectedVersion) throw new AppError(409, "This lesson changed. Reload before saving.");
      if (input.prerequisiteId) {
        const visited = new Set(id ? [id] : []); let cursor: string | null = input.prerequisiteId;
        while (cursor) {
          if (visited.has(cursor)) throw new AppError(400, "Lessons cannot depend on themselves.");
          visited.add(cursor);
          const parent: Lesson | null = await q("SELECT * FROM lessons WHERE id=?", cursor).first<Lesson>();
          if (!parent || (input.published && !parent.published)) throw new AppError(400, "Choose a published prerequisite.");
          cursor = parent.prerequisite_id;
        }
      }
      if (input.published) {
        if (!input.summary.trim() || !input.body.trim() || !input.check.question.trim() || !input.check.explanation.trim() || input.check.options.some(option => !option.text.trim())) throw new AppError(400, "Finish the lesson and quick check before publishing.");
        const reward = input.rewardPromptId ? await q("SELECT * FROM prompts WHERE id=? AND status='published'", input.rewardPromptId).first<Prompt>() : null;
        if (!reward?.prompt_text) throw new AppError(400, "Choose a published, copy-ready reward recipe first.");
        if (!input.check.options.some(option => option.id === input.check.correct)) throw new AppError(400, "Choose the correct answer.");
      }
      if (!input.published && id && await q("SELECT id FROM lessons WHERE prerequisite_id=? AND published=1", id).first()) throw new AppError(409, "Unpublish dependent lessons first.");
      const time = now(); const recordId = id ?? uid();
      if (current) {
        const result = await db.batch([
          q("INSERT OR IGNORE INTO editorial_versions(id,kind,record_id,version,snapshot,editor_id,created_at) VALUES (?,'lesson',?,?,?,?,?)", uid(), id, current.version, JSON.stringify(current), actor.id, time),
          q("UPDATE lessons SET title=?,summary=?,body=?,minutes=?,position=?,prerequisite_id=?,reward_prompt_id=?,published=?,check_data=?,version=version+1,updated_at=? WHERE id=? AND version=?", input.title, input.summary, input.body, input.minutes, input.position, input.prerequisiteId, input.rewardPromptId, Number(input.published), JSON.stringify(input.check), time, id, expectedVersion),
        ]);
        if (!result[1].meta?.changes) throw new AppError(409, "This lesson changed. Reload before saving.");
      } else await q("INSERT INTO lessons(id,slug,title,eyebrow,summary,body,minutes,position,prerequisite_id,reward_prompt_id,published,check_data,created_at,updated_at) VALUES (?,?,?,'Beginner',?,?,?,?,?,?,?,?,?,?)", recordId, slugify(input.title) + "-" + recordId.slice(0, 6), input.title, input.summary, input.body, input.minutes, input.position, input.prerequisiteId, input.rewardPromptId, Number(input.published), JSON.stringify(input.check), time, time).run();
      return recordId;
    },
  };
  return api;
}
