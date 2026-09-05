import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { promptExercises } from "../lib/prompt-exercises.ts";
import { projectRecipes } from "../lib/recipe-content.ts";

test("packages the Worker and Sites runtime metadata", async () => {
  const worker = await readFile(new URL("../dist/server/index.js", import.meta.url), "utf8");
  const hosting = JSON.parse(
    await readFile(new URL("../dist/.openai/hosting.json", import.meta.url), "utf8"),
  );
  const migration = await readFile(
    new URL("../dist/.openai/drizzle/0000_peaceful_siren.sql", import.meta.url),
    "utf8",
  );

  assert.match(worker, /vinext/);
  assert.match(hosting.project_id, /^appgprj_/);
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, "BUCKET");
  assert.match(migration, /CREATE TABLE `prompts`/);
  const libraryMigration = await readFile(new URL("../dist/.openai/drizzle/0002_square_bishop.sql", import.meta.url), "utf8");
  assert.match(libraryMigration, /CREATE TABLE `library_items`/);
});

test("public browser bundles exclude full reward instructions", async () => {
  async function javascript(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const contents = await Promise.all(entries.map(entry => {
      const target = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
      return entry.isDirectory() ? javascript(target) : entry.name.endsWith(".js") ? readFile(target, "utf8") : "";
    }));
    return contents.join("\n");
  }
  const client = await javascript(new URL("../dist/client/", import.meta.url));
  assert.ok(client.length > 1000);
  for (const exercise of Object.values(promptExercises)) assert.ok(!client.includes(exercise.referenceAnswer), "Reference answer leaked into a public bundle");
  for (const recipe of projectRecipes) assert.ok(!client.includes(recipe.text.split("\n")[0]), `${recipe.title} leaked into a public bundle`);
});
