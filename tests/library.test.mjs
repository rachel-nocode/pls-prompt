import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createRepository } from "../lib/repository.ts";
import { seedDatabase } from "../lib/seed-database.ts";
import { seedPrompts, seedLessons } from "../lib/content.ts";
import { promptExercises } from "../lib/prompt-exercises.ts";
import { beginnerLessons, projectRecipes } from "../lib/recipe-content.ts";

const member = { id: "learner-one", displayName: "Learner", isCreator: false };
const other = { id: "learner-two", displayName: "Another learner", isCreator: false };
const creator = { id: "creator", displayName: "Creator", isCreator: true };
const input = { title: "My build", promptText: "Build a useful app.", notes: "Try next week", tags: ["app", "ideas"] };
const promptEdit = (prompt, changes = {}) => ({ title: prompt.title, promise: prompt.promise, promptText: prompt.prompt_text, category: prompt.category, tags: JSON.parse(prompt.tags), status: prompt.status, accessMode: prompt.access_mode, ...changes });
const lessonEdit = (lesson, changes = {}) => ({ title: lesson.title, summary: lesson.summary, body: lesson.body, minutes: lesson.minutes, position: lesson.position, prerequisiteId: lesson.prerequisite_id, rewardPromptId: lesson.reward_prompt_id, published: Boolean(lesson.published), check: JSON.parse(lesson.check_data), ...changes });
const fails = (promise, status) => assert.rejects(promise, error => error.status === status);

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  const db = {
    failBatchAt: -1,
    beforeBatch: null,
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values) }; },
        async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }; },
      };
    },
    async batch(statements) {
      this.beforeBatch?.(); this.beforeBatch = null;
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const results = [];
        for (const [index, statement] of statements.entries()) {
          if (index === this.failBatchAt) { this.failBatchAt = -1; throw new Error("Simulated storage failure"); }
          results.push(await statement.run());
        }
        sqlite.exec("COMMIT");
        return results;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  const migrations = readdirSync(new URL("../drizzle/", import.meta.url)).filter(file => file.endsWith(".sql")).sort();
  const migrate = (files = migrations) => files.forEach(file => sqlite.exec(readFileSync(new URL("../drizzle/" + file, import.meta.url), "utf8")));
  return { sqlite, db, migrate, migrations };
}
async function setup(t) {
  const context = database(); t.after(() => context.sqlite.close()); context.migrate();
  await seedDatabase(context.db);
  return { ...context, store: createRepository(context.db) };
}
const lesson = async (store, index = 0) => (await store.publicLessons())[index];
const pass = async (store, actor = member, index = 0) => {
  const current = await lesson(store, index);
  return store.completeLesson(actor, current.slug, promptExercises[current.id].referenceAnswer, current.version);
};

test("migration preserves legacy text and saves; backfill deduplicates the earliest save", async t => {
  const { sqlite, db, migrate, migrations } = database(); t.after(() => sqlite.close());
  migrate(migrations.slice(0, 2));
  for (const [table, records] of [["prompts", seedPrompts], ["lessons", seedLessons]]) {
    for (const record of records) sqlite.prepare(`INSERT INTO ${table}(${Object.keys(record).join(",")}) VALUES (${Object.keys(record).map(() => "?").join(",")})`).run(...Object.values(record));
  }
  sqlite.prepare("INSERT INTO prompt_saves(id,prompt_id,user_id,created_at) VALUES (?,?,?,?)").run("first", seedPrompts[0].id, member.id, "2026-01-01");
  sqlite.prepare("INSERT INTO prompt_saves(id,prompt_id,user_id,created_at) VALUES (?,?,?,?)").run("repeat", seedPrompts[0].id, member.id, "2026-02-01");
  migrate(migrations.slice(2)); await seedDatabase(db);
  assert.equal(sqlite.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM prompt_saves").get().n, 2);
  for (const old of seedPrompts) {
    const current = sqlite.prepare("SELECT * FROM prompts WHERE id=?").get(old.id);
    assert.equal(current.prompt_text, old.prompt_text); assert.equal(current.access_mode, "free");
  }
  const items = (await createRepository(db).library(member)).items;
  assert.equal(items.length, 1); assert.equal(items[0].id, "legacy-first"); assert.equal(items[0].prompt_text, seedPrompts[0].prompt_text);
});

test("content setup runs once and preserves later creator edits", async t => {
  const { db, store, sqlite } = await setup(t);
  const record = (await store.studio(creator)).lessons[0];
  await store.editLesson(creator, record.id, record.version, lessonEdit(record, { title: "My revised lesson" }));
  await seedDatabase(db); await seedDatabase(db);
  assert.equal((await lesson(store)).title, "My revised lesson");
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM prompts").get().n, 9);
});

test("public metadata and lesson payloads exclude locked text, assets, and answers", async t => {
  const { store, sqlite } = await setup(t);
  sqlite.prepare("UPDATE prompts SET asset_key='locked.md',github_url='https://github.com/private-recipe' WHERE id=?").run(projectRecipes[0].id);
  const summaries = await store.listPrompts();
  assert.equal(summaries.length, 9);
  for (const record of summaries) for (const key of ["prompt_text", "github_url", "asset_key"]) assert.equal(key in record, false);
  const lessons = await store.publicLessons();
  for (const current of lessons) for (const key of ["check_data", "correct", "explanation"]) assert.equal(key in current, false);
  for (const actor of [null, member]) {
    const locked = await store.promptBySlug(projectRecipes[0].slug, actor);
    assert.equal(locked.accessible, false); assert.equal(locked.prompt_text, null); assert.equal(locked.asset_key, null); assert.equal(locked.github_url, null);
  }
  assert.equal(await store.canReadAsset("locked.md", member), false);
  await pass(store);
  assert.equal(await store.canReadAsset("locked.md", member), true);
  assert.equal(await store.canReadAsset("locked.md", other), false);
  assert.equal((await store.promptBySlug(projectRecipes[0].slug, member)).prompt_text, projectRecipes[0].text);
  assert.equal((await store.promptBySlug(seedPrompts[0].slug, null)).prompt_text, seedPrompts[0].prompt_text);
});

test("wrong answers, missing prerequisites, and stale lessons award nothing", async t => {
  const { store } = await setup(t); const first = await lesson(store); const second = await lesson(store, 1);
  assert.equal((await store.completeLesson(member, first.slug, "a", first.version)).completed, false);
  assert.equal((await store.completeLesson(member, first.slug, "invalid", first.version)).grade.passed, false);
  await fails(store.completeLesson(member, first.slug, "b", first.version - 1), 409);
  await fails(store.completeLesson(member, second.slug, "c", second.version), 409);
  await fails(store.savePrompt(member, projectRecipes[0].id), 403);
  assert.equal((await store.completions(member)).length, 0); assert.equal((await store.library(member)).items.length, 0);
});

test("completion grants a complete recipe once and survives signing back in", async t => {
  const { store, db, sqlite } = await setup(t);
  const first = await pass(store); const repeated = await pass(store);
  assert.equal(first.item.prompt_text, projectRecipes[0].text); assert.equal(repeated.item.id, first.item.id);
  await pass(store, member, 1); await pass(store, member, 2);
  const resumed = createRepository(db);
  assert.equal((await resumed.library({ ...member })).items.length, 3);
  assert.equal((await resumed.completions(member)).length, 3);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM prompt_access").get().n, 3);
  assert.equal((await resumed.library(other)).items.length, 0);
});

test("storage failure rolls back completion, access, and automatic collection together", async t => {
  const { store, db, sqlite } = await setup(t); db.failBatchAt = 2;
  await assert.rejects(pass(store), /Simulated storage failure/);
  for (const table of ["lesson_completions", "prompt_access", "library_items"]) assert.equal(sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 0);
  assert.equal((await pass(store)).completed, true);
});

test("a concurrently revised lesson cannot claim completion from an existing saved copy", async t => {
  const { store, db, sqlite } = await setup(t);
  sqlite.prepare("UPDATE prompts SET access_mode='free' WHERE id=?").run(projectRecipes[0].id);
  await store.savePrompt(member, projectRecipes[0].id);
  db.beforeBatch = () => sqlite.prepare("UPDATE lessons SET version=version+1 WHERE id=?").run(beginnerLessons[0].id);
  await fails(pass(store), 409);
  assert.equal((await store.completions(member)).length, 0);
});

test("a concurrent private edit is retained and a stale writer gets a conflict", async t => {
  const { store, db, sqlite } = await setup(t); const item = await store.createItem(member, input);
  db.beforeBatch = () => sqlite.prepare("UPDATE library_items SET prompt_text='Newer change',version=2 WHERE id=?").run(item.id);
  await fails(store.updateItem(member, item.id, 1, { ...input, promptText: "Stale change" }), 409);
  assert.equal((await store.library(member)).items[0].prompt_text, "Newer change");
});

test("private edits, notes, tags, and all previous versions can be restored", async t => {
  const { store } = await setup(t); const item = await store.createItem(member, input);
  const edited = await store.updateItem(member, item.id, 1, { ...input, promptText: "My improved build", notes: "This worked", tags: ["tested"] });
  assert.equal(edited.version, 2);
  await fails(store.updateItem(member, item.id, 1, input), 409);
  const restored = await store.restoreItem(member, item.id, 1, 2);
  assert.equal(restored.version, 3); assert.equal(restored.notes, input.notes); assert.equal(restored.prompt_text, input.promptText);
  assert.deepEqual((await store.itemVersions(member, item.id)).map(version => version.version), [3, 2, 1]);
});

test("another member cannot read, modify, restore, archive, or file private work", async t => {
  const { store } = await setup(t); const item = await store.createItem(member, input); const folder = await store.createCollection(member, "Builds");
  assert.equal((await store.library(other)).items.length, 0);
  for (const operation of [
    store.updateItem(other, item.id, 1, input), store.itemVersions(other, item.id),
    store.restoreItem(other, item.id, 1, 1), store.archiveItem(other, item.id, true),
    store.renameCollection(other, folder.id, "Stolen"), store.setCollection(other, folder.id, item.id, true),
  ]) await fails(operation, 404);
  const outsidersItem = await store.createItem(other, input);
  await fails(store.setCollection(other, folder.id, outsidersItem.id, true), 404);
  await fails(store.setCollection(member, folder.id, outsidersItem.id, true), 404);
});

test("collections and archive restore preserve the original prompt", async t => {
  const { store } = await setup(t); const item = await store.createItem(member, input); const folder = await store.createCollection(member, "Builds");
  await store.setCollection(member, folder.id, item.id, true); await store.setCollection(member, folder.id, item.id, true);
  await store.renameCollection(member, folder.id, "Next builds"); await store.archiveItem(member, item.id, true);
  let library = await store.library(member); assert.equal(library.memberships.length, 1); assert.ok(library.items[0].archived_at);
  await store.archiveItem(member, item.id, false); library = await store.library(member);
  assert.equal(library.items[0].archived_at, null); assert.equal(library.items[0].prompt_text, input.promptText); assert.equal(library.collections[0].title, "Next builds");
  await store.setCollection(member, folder.id, item.id, false); assert.equal((await store.library(member)).memberships.length, 0);
});

test("full exports include personal history and collections without another user's work", async t => {
  const { store } = await setup(t); const item = await store.createItem(member, input);
  await store.updateItem(member, item.id, 1, { ...input, notes: "My update" });
  const folder = await store.createCollection(member, "Favorites"); await store.setCollection(member, folder.id, item.id, true);
  await store.createItem(other, { ...input, title: "Other person's secret" });
  const exported = await store.exportLibrary(member);
  assert.equal(exported.items.length, 1); assert.equal(exported.versions.length, 2); assert.equal(exported.collections.length, 1); assert.equal(exported.memberships.length, 1);
  assert.ok(!JSON.stringify(exported).includes("Other person's secret"));
});

test("saving an attachment preserves its protected source link", async t => {
  const { store, sqlite } = await setup(t);
  sqlite.prepare("UPDATE prompts SET prompt_text=NULL,asset_key='legacy.md' WHERE id=?").run(seedPrompts[0].id);
  const item = await store.savePrompt(member, seedPrompts[0].id);
  assert.equal(item.source_url, "/assets/legacy.md");
  assert.equal(await store.canReadAsset("legacy.md", null), true);
});

test("saving again or editing the source never overwrites a learner's improvements", async t => {
  const { store } = await setup(t); const completed = await pass(store);
  await store.updateItem(member, completed.item.id, 1, input);
  const source = (await store.studio(creator)).prompts.find(prompt => prompt.id === projectRecipes[0].id);
  await store.editPrompt(creator, source.id, source.version, promptEdit(source, { promptText: "New upstream instructions" }));
  const saved = await store.savePrompt(member, source.id); assert.equal(saved.prompt_text, input.promptText); assert.equal(saved.version, 2);
  assert.equal((await pass(store)).item.prompt_text, input.promptText);
});

test("creator permissions and publication dependencies are enforced on the server", async t => {
  const { store } = await setup(t); const studio = await store.studio(creator);
  const recipe = studio.prompts.find(prompt => prompt.id === projectRecipes[0].id); const current = studio.lessons[0];
  await fails(store.studio(member), 403);
  await fails(store.editPrompt(member, recipe.id, recipe.version, promptEdit(recipe)), 403);
  await fails(store.editLesson(member, current.id, current.version, lessonEdit(current)), 403);
  await fails(store.editPrompt(creator, recipe.id, recipe.version, promptEdit(recipe, { status: "draft" })), 409);
  await fails(store.editLesson(creator, current.id, current.version, lessonEdit(current, { prerequisiteId: studio.lessons[2].id })), 400);
  await fails(store.editLesson(creator, current.id, current.version, lessonEdit(current, { published: false })), 409);
  await fails(store.editLesson(creator, current.id, current.version, lessonEdit(current, { rewardPromptId: null })), 400);
  const free = studio.prompts.find(prompt => prompt.id === seedPrompts[0].id);
  await fails(store.editPrompt(creator, free.id, free.version, promptEdit(free, { accessMode: "earned" })), 400);
});

test("rough drafts stay private and can become published lessons with full recipes", async t => {
  const { store } = await setup(t);
  const prompt = { title: "New recipe", promise: "", promptText: "", category: "Projects", tags: [], status: "draft", accessMode: "earned" };
  const promptId = await store.editPrompt(creator, null, 0, prompt);
  assert.equal((await store.listPrompts()).some(item => item.id === promptId), false);
  await fails(store.editPrompt(creator, promptId, 1, { ...prompt, status: "published" }), 400);
  await store.editPrompt(creator, promptId, 1, { ...prompt, status: "published", promise: "Build a project", promptText: projectRecipes[0].text });
  const draft = { title: "New lesson", summary: "", body: "", minutes: 3, position: 4, prerequisiteId: null, rewardPromptId: null, published: false, check: { ...promptExercises["lesson-outcomes"], goal: "", referenceAnswer: "" } };
  const lessonId = await store.editLesson(creator, null, 0, draft);
  assert.equal((await store.publicLessons()).some(item => item.id === lessonId), false);
  await fails(store.editLesson(creator, lessonId, 1, { ...draft, published: true }), 400);
  const completed = { ...draft, summary: "One small concept", body: "Say what you want to build.", rewardPromptId: promptId, check: promptExercises["lesson-outcomes"], published: true };
  await store.editLesson(creator, lessonId, 1, completed);
  assert.equal((await store.publicLessons()).some(item => item.id === lessonId), true);
});

test("beginner lessons stay short and reward complete projects without empty placeholders", () => {
  assert.equal(beginnerLessons.length, 3);
  for (const current of beginnerLessons) {
    assert.ok(current.minutes <= 5); assert.ok(current.body.split(/\s+/).length < 180);
    assert.equal(current.body.split(/\n\s*\n/).length, 3);
    assert.equal(promptExercises[current.id].kind, "prompt-completion");
    const recipe = projectRecipes.find(recipe => recipe.id === current.reward);
    assert.ok(recipe); assert.ok(recipe.text.split(/\s+/).length > 350);
    assert.doesNotMatch(recipe.text, /\{\{|\[insert|TODO|TBD/i);
  }
});

test("anonymous practice grades all lessons without progress, access, or recipe text", async t => {
  const { store, sqlite } = await setup(t);
  for (const current of await store.publicLessons()) {
    const result = await store.completeLesson(null, current.slug, promptExercises[current.id].referenceAnswer, current.version);
    assert.equal(result.grade.passed, true); assert.equal(result.completed, false); assert.equal(result.item, null);
    assert.ok(!JSON.stringify(result).includes(projectRecipes[0].text.slice(0, 80)));
    assert.equal("referenceAnswer" in current.exercise, false);
    assert.equal("explanation" in current.exercise, false);
    for (const criterion of current.exercise.criteria) assert.deepEqual(Object.keys(criterion).sort(), ["id", "label"]);
  }
  for (const table of ["lesson_completions", "prompt_access", "library_items"]) assert.equal(sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 0);
});

test("partial writing and old choice IDs never award a recipe; revision can pass", async t => {
  const { store } = await setup(t); const current = await lesson(store);
  for (const answer of ["a", "b", "c", "view project progress and leave feedback."]) {
    const result = await store.completeLesson(member, current.slug, answer, current.version);
    assert.equal(result.grade.passed, false); assert.equal(result.completed, false); assert.equal(result.item, null);
  }
  assert.equal((await store.library(member)).items.length, 0);
  const passed = await pass(store); assert.equal(passed.completed, true);
  const review = await store.completeLesson(member, current.slug, "make something really cool", current.version);
  assert.equal(review.grade.passed, false); assert.equal((await store.library(member)).items.length, 1);
  assert.equal((await pass(store)).item.id, passed.item.id);
});

test("exercise upgrade preserves earned recipes and custom lesson edits", async t => {
  const { store, sqlite, db } = await setup(t); const reward = (await pass(store)).item;
  await store.updateItem(member, reward.id, reward.version, input);
  sqlite.prepare("DELETE FROM content_revisions WHERE id='prompt-completion-exercises-v1'").run();
  for (const current of beginnerLessons) sqlite.prepare("UPDATE lessons SET check_data=? WHERE id=?").run(JSON.stringify(current.check), current.id);
  sqlite.prepare("UPDATE lessons SET body='My revised teaching text' WHERE id=?").run(beginnerLessons[0].id);
  const customCheck = JSON.stringify({ ...beginnerLessons[1].check, question: "Custom creator question" });
  sqlite.prepare("UPDATE lessons SET check_data=? WHERE id=?").run(customCheck, beginnerLessons[1].id);
  const versions = sqlite.prepare("SELECT id,version FROM lessons ORDER BY position").all();
  await seedDatabase(db); await seedDatabase(db);
  assert.equal((await lesson(store)).body, "My revised teaching text");
  assert.equal((await lesson(store)).version, versions[0].version + 1);
  assert.equal((await lesson(store, 1)).exercise, null);
  assert.equal(sqlite.prepare("SELECT check_data FROM lessons WHERE id=?").get(beginnerLessons[1].id).check_data, customCheck);
  assert.equal((await store.completions(member)).length, 1);
  assert.equal((await store.library(member)).items[0].prompt_text, input.promptText);
  assert.equal((await pass(store)).item.id, reward.id);
});

test("exercise upgrade is atomic and can recover from a storage failure", async t => {
  const { sqlite, db } = await setup(t);
  sqlite.prepare("DELETE FROM content_revisions WHERE id='prompt-completion-exercises-v1'").run();
  for (const current of beginnerLessons) sqlite.prepare("UPDATE lessons SET check_data=? WHERE id=?").run(JSON.stringify(current.check), current.id);
  db.failBatchAt = 1;
  await assert.rejects(seedDatabase(db), /Simulated storage failure/);
  assert.equal(sqlite.prepare("SELECT id FROM content_revisions WHERE id='prompt-completion-exercises-v1'").get(), undefined);
  assert.equal(JSON.parse(sqlite.prepare("SELECT check_data FROM lessons WHERE id=?").get(beginnerLessons[0].id).check_data).correct, "b");
  await seedDatabase(db);
  assert.equal(JSON.parse(sqlite.prepare("SELECT check_data FROM lessons WHERE id=?").get(beginnerLessons[0].id).check_data).kind, "prompt-completion");
});

test("creator cannot publish an exercise whose own reference answer fails", async t => {
  const { store } = await setup(t); const current = (await store.studio(creator)).lessons[0];
  await fails(store.editLesson(creator, current.id, current.version, lessonEdit(current, { check: { ...promptExercises[current.id], referenceAnswer: "make something really nice" } })), 400);
});
