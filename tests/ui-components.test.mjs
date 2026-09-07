import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits the catalog's mobile and rendering safeguards", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /content-visibility:\s*auto/);
  assert.match(css, /contain-intrinsic-size:\s*auto 700px/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});

test("retired lesson endpoints reject submissions without granting recipes", async () => {
  for (const action of ["check", "complete"]) {
    const { POST } = await vite.ssrLoadModule(`/app/api/lessons/[slug]/${action}/route.ts`);
    const response = await POST();
    assert.equal(response.status, 410);
    assert.match((await response.json()).error, /no longer available/);
  }
});

test("recipe markdown preview formats content without enabling HTML or editing", async () => {
  const { MarkdownPreview } = await vite.ssrLoadModule("/components/markdown-preview.tsx");
  const html = renderToStaticMarkup(React.createElement(MarkdownPreview, { text: '# Build a project\n\n**Clear outcome**\n\n- First step\n- Second step\n\n```js\nconst safe = true;\n```\n\n<script>alert(1)</script>\n\n[Unsafe](javascript:alert%281%29)' }));
  assert.match(html, /<h1>Build a project<\/h1>/);
  assert.match(html, /<strong>Clear outcome<\/strong>/);
  assert.match(html, /<li>First step<\/li>/);
  assert.match(html, /<pre><code/);
  assert.doesNotMatch(html, /<script|href="javascript:|<textarea|contenteditable/i);
});
