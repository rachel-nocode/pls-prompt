import assert from "node:assert/strict";
import { beginnerLessons, projectRecipes } from "../lib/recipe-content.ts";

const base = new URL(process.argv[2] ?? "http://localhost:5173");
if (!["localhost", "127.0.0.1"].includes(base.hostname)) throw new Error("Use a disposable local development database only.");
const run = crypto.randomUUID();
const learner = { id: `http-test-${run}`, email: "learner@example.test" };
const outsider = { id: `http-other-${run}`, email: "other@example.test" };
const creator = { id: `http-creator-${run}`, email: "creator@example.test" };
let checks = 0;
async function request(path, actor = null, body, expected = 200, extraHeaders = {}) {
  const response = await fetch(new URL(path, base), {
    method: body === undefined ? "GET" : "POST", redirect: "manual", signal: AbortSignal.timeout(15000),
    headers: {
      ...(actor ? { "oai-authenticated-user-id": actor.id, "oai-authenticated-user-email": actor.email } : {}),
      ...(body === undefined ? {} : { "content-type": "application/json", origin: base.origin }), ...extraHeaders,
    }, body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.status, expected, `${path}: ${text.slice(0, 250)}`); checks++;
  return { response, text, json: response.headers.get("content-type")?.includes("application/json") ? JSON.parse(text) : null };
}
await request("/api/library", null, undefined, 401);
await request("/api/studio", learner, undefined, 403);
await request("/library", null, undefined, 307);
await request("/studio", learner, undefined, 404);
const studio = (await request("/api/studio", creator)).json;
const lessons = beginnerLessons.map(current => studio.lessons.find(record => record.id === current.id));
const catalog = (await request("/api/prompts")).json;
assert.ok(catalog.prompts.length >= 9);
for (const prompt of catalog.prompts) assert.equal("prompt_text" in prompt, false);
for (const path of ["/", "/learn", `/learn/${lessons[0].slug}`, `/prompts/${projectRecipes[0].slug}`]) {
  const { text } = await request(path);
  assert.ok(!text.includes(projectRecipes[0].text.slice(0, 140)), `${path} leaked locked recipe text`);
}
const firstPath = `/api/lessons/${lessons[0].slug}/complete`;
await request(firstPath, null, { answer: "b", version: lessons[0].version }, 401);
await request(firstPath, learner, { answer: "b", version: lessons[0].version }, 403, { origin: "https://outside.example" });
await request("/api/library", learner, { action: "save", promptId: projectRecipes[0].id }, 403);
const wrong = (await request(firstPath, learner, { answer: "a", version: lessons[0].version })).json;
assert.equal(wrong.completed, false);
await request(`/api/lessons/${lessons[1].slug}/complete`, learner, { answer: "c", version: lessons[1].version }, 409);
const completed = await Promise.all(Array.from({ length: 5 }, () => request(firstPath, learner, { answer: "b", version: lessons[0].version })));
const item = completed[0].json.item;
for (const result of completed) { assert.equal(result.json.completed, true); assert.equal(result.json.item.id, item.id); assert.equal(result.json.item.prompt_text, projectRecipes[0].text); }
const persisted = (await request("/api/library", { ...learner })).json;
assert.equal(persisted.items.length, 1);
assert.equal((await request("/api/library", outsider)).json.items.length, 0);
await request(`/api/library?history=${item.id}`, outsider, undefined, 404);
const input = { title: "My project", promptText: "My private customization", notes: "Keep this variation", tags: ["favorite"] };
await request("/api/library", outsider, { action: "update", id: item.id, version: item.version, input }, 404);
await request("/api/library", learner, { action: "update", id: item.id, version: item.version, input });
await request("/api/library", learner, { action: "update", id: item.id, version: item.version, input }, 409);
const history = (await request(`/api/library?history=${item.id}`, learner)).json;
assert.equal(history.versions.length, 2);
const restored = (await request("/api/library", learner, { action: "restoreVersion", id: item.id, version: 1, expectedVersion: 2 })).json;
assert.equal(restored.result.prompt_text, projectRecipes[0].text);
const exported = await request("/api/library?export=json", learner);
assert.match(exported.response.headers.get("content-disposition"), /attachment/);
assert.match(exported.response.headers.get("cache-control"), /private, no-store/);
assert.equal(exported.json.versions.length, 3);
for (const index of [1, 2]) await request(`/api/lessons/${lessons[index].slug}/complete`, learner, { answer: beginnerLessons[index].check.correct, version: lessons[index].version });
assert.equal((await request("/api/library", learner)).json.items.length, 3);
await request("/library", learner);
await request("/studio", creator);
const draftInput = { title: `HTTP draft ${run}`, promise: "", promptText: "", category: "Projects", tags: [], status: "draft", accessMode: "earned" };
const draft = (await request("/api/studio", creator, { kind: "prompt", id: null, version: 0, input: draftInput })).json;
await request("/api/studio", learner, { kind: "prompt", id: draft.id, version: 1, input: draftInput }, 403);
assert.equal((await request("/api/prompts")).json.prompts.some(prompt => prompt.id === draft.id), false);
const emptyCheck = { question: "", options: [{ id: "a", text: "" }, { id: "b", text: "" }], correct: "a", explanation: "" };
await request("/api/studio", creator, { kind: "lesson", id: null, version: 0, input: { title: `HTTP lesson draft ${run}`, summary: "", body: "", minutes: 3, position: 99, prerequisiteId: null, rewardPromptId: null, published: false, check: emptyCheck } });
const form = new FormData(); form.set("file", new File(["Private attachment fixture"], "phase1.txt", { type: "text/plain" }));
const upload = await fetch(new URL("/api/uploads", base), { method: "POST", body: form, headers: { "oai-authenticated-user-id": learner.id, "oai-authenticated-user-email": learner.email, origin: base.origin }, signal: AbortSignal.timeout(15000) });
assert.equal(upload.status, 201); checks++;
const { assetKey } = await upload.json(); const assetPath = "/assets/" + assetKey;
const attachment = await request(assetPath, learner); assert.equal(attachment.text, "Private attachment fixture");
assert.equal(attachment.response.headers.get("cache-control"), "private, no-store");
await request(assetPath, outsider, undefined, 404); await request(assetPath, null, undefined, 404);
const submission = { title: `HTTP attachment ${run}`, promise: "A private attachment for verification", promptText: null, githubUrl: null, assetKey, category: "Code", models: [] };
await request("/api/prompts", outsider, submission, 403);
await request("/api/prompts", learner, { ...submission, assetKey: null, githubUrl: "javascript://github.com/%0aalert(1)" }, 400);
const submitted = (await request("/api/prompts", learner, submission, 201)).json.prompt;
const published = { title: submission.title, promise: submission.promise, promptText: "", category: "Code", tags: [], status: "published", accessMode: "free" };
await request("/api/studio", creator, { kind: "prompt", id: submitted.id, version: 1, input: published });
assert.equal((await request(assetPath)).text, "Private attachment fixture");
const bookmarked = (await request("/api/library", outsider, { action: "save", promptId: submitted.id })).json.result;
assert.equal(bookmarked.source_url, assetPath);
await request("/api/studio", creator, { kind: "prompt", id: submitted.id, version: 2, input: { ...published, status: "draft" } });
await request(assetPath, outsider, undefined, 404);
console.log(`${checks} local HTTP checks passed: sign-in, creator permissions, complete beginner path, concurrent reward grants, private editing, history, export, and attachment privacy.`);
