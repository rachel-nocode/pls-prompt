import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const hosting = JSON.parse(await readFile(".openai/hosting.json", "utf8"));
await mkdir(".sites-runtime", { recursive: true });
await writeFile(".sites-runtime/local-database.json", JSON.stringify({
  name: "pls-prompt-local",
  compatibility_date: "2026-09-05",
  d1_databases: [{ binding: hosting.d1, database_name: "site-creator-d1", database_id: "00000000-0000-4000-8000-000000000000", migrations_dir: resolve("drizzle") }],
}));
const result = spawnSync("node_modules/.bin/wrangler", ["d1", "migrations", "apply", hosting.d1, "--local", "--config", ".sites-runtime/local-database.json", "--persist-to", resolve(process.argv[2] ?? ".wrangler/state")], {
  stdio: "inherit", env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/logs" },
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
