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

test("beginner exercises render an accessible prompt composer without answer choices", async () => {
  const { LessonPlayer } = await vite.ssrLoadModule("/components/lesson-player.tsx");
  const { promptExercises } = await import("../lib/prompt-exercises.ts");
  const { publicExercise } = await import("../lib/prompt-grading.ts");
  for (const [id, exercise] of Object.entries(promptExercises)) {
    const html = renderToStaticMarkup(React.createElement(LessonPlayer, {
      lesson: { id, slug: id, version: 3, title: "A small lesson", summary: "Write a clear prompt.", position: 1, minutes: 3, body: "One short idea.", exercise: publicExercise(exercise) },
      completed: false, locked: false, signIn: "/signin-with-chatgpt", localPreview: true, learnerKey: "guest", previous: null, next: null, initialReward: null,
    }));
    assert.match(html, /<textarea[^>]*id="prompt-answer"/);
    assert.match(html, /<label[^>]*for="prompt-answer"/);
    assert.match(html, /aria-describedby="prompt-prefix prompt-suffix prompt-help"/);
    assert.match(html, /Check my prompt/); assert.match(html, /Guided checks/);
    assert.doesNotMatch(html, /type="radio"|role="radiogroup"/);
    assert.ok(!html.includes(exercise.referenceAnswer));
  }
});

test("locked, unavailable, and previously collected lesson states render safely", async () => {
  const { LessonPlayer } = await vite.ssrLoadModule("/components/lesson-player.tsx");
  const { promptExercises } = await import("../lib/prompt-exercises.ts");
  const { publicExercise } = await import("../lib/prompt-grading.ts");
  const props = { lesson: { id: "test", slug: "test", version: 3, title: "A lesson", position: 1, minutes: 3, body: "One idea.", exercise: publicExercise(promptExercises["lesson-outcomes"]) }, completed: false, locked: true, signIn: null, localPreview: true, learnerKey: "test", previous: { slug: "previous", title: "Previous lesson" }, next: null, initialReward: null };
  const locked = renderToStaticMarkup(React.createElement(LessonPlayer, props));
  assert.match(locked, /Finish the previous lesson/); assert.doesNotMatch(locked, /<textarea/);
  const unavailable = renderToStaticMarkup(React.createElement(LessonPlayer, { ...props, locked: false, lesson: { ...props.lesson, exercise: null } }));
  assert.match(unavailable, /This exercise is being prepared/); assert.doesNotMatch(unavailable, /<textarea/);
  const collected = renderToStaticMarkup(React.createElement(LessonPlayer, { ...props, locked: false, completed: true, initialReward: { id: "reward", prompt_text: "Private collected recipe" } }));
  assert.match(collected, /IN YOUR LIBRARY/); assert.match(collected, /Private collected recipe/); assert.match(collected, /<textarea/);
});
