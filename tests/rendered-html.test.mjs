import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
});
