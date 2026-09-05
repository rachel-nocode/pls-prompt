import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

await mkdir(".sites-runtime", { recursive: true });
await writeFile(".sites-runtime/typecheck.json", JSON.stringify({
  name: "pls-prompt-types",
  compatibility_date: "2026-09-05",
  compatibility_flags: ["nodejs_compat"],
}));
for (const [command, args] of [
  ["node_modules/.bin/wrangler", ["types", "cloudflare-runtime.d.ts", "--config", ".sites-runtime/typecheck.json", "--include-env=false"]],
  ["node_modules/.bin/tsc", ["--noEmit", "--pretty", "false"]],
]) {
  const result = spawnSync(command, args, { stdio: "inherit", env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/logs" } });
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
}
