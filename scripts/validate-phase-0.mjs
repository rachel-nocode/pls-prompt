import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const content = JSON.parse(await readFile(new URL('../docs/phase-0/content-map.json', import.meta.url), 'utf8'));
const curriculum = JSON.parse(await readFile(new URL('../docs/phase-0/starter-lessons.json', import.meta.url), 'utf8'));
const { seedPrompts, seedLessons } = await import('../lib/content.ts');
const sourcePrompts = new Map(seedPrompts.map(prompt => [prompt.id, prompt]));
const sourceLessons = new Map(seedLessons.map(lesson => [lesson.id, lesson]));
const lessonIds = new Set(curriculum.lessons.map(lesson => lesson.id));

function passes(output, expected) {
  const lines = output.split(/\r?\n/).map(line => line.trim()).filter(Boolean).sort();
  return JSON.stringify(lines) === JSON.stringify([...expected].sort());
}

assert.equal(content.prompts.length, 6);
assert.equal(new Set(content.prompts.map(prompt => prompt.id)).size, 6);
assert.equal(content.prompts.filter(prompt => prompt.selected_for_starter).length, 5);
assert.equal(curriculum.lessons.length, 3);
assert.equal(lessonIds.size, 3);
for (const prompt of content.prompts) {
  const source = sourcePrompts.get(prompt.id);
  assert.ok(source, 'Unknown prompt: ' + prompt.id);
  assert.equal(source.slug, prompt.slug);
  assert.equal(prompt.access, 'free');
  if (!prompt.selected_for_starter) continue;
  assert.ok(source.prompt_text, 'Starter prompt requires owned inline content');
  assert.ok(lessonIds.has(prompt.lesson), 'Linked lesson is missing');
  const variables = [...source.prompt_text.matchAll(/\{\{([a-z_]+)\}\}/g)].map(match => match[1]);
  assert.deepEqual([...new Set(variables)].sort(), [...prompt.variables].sort());
}

let cases = 0;
let checks = 0;
const completed = new Set();
const caseIds = new Set();
for (const lesson of curriculum.lessons) {
  assert.equal(lesson.slug, sourceLessons.get(lesson.id)?.slug, 'Existing lesson URL must stay valid');
  for (const prerequisite of lesson.prerequisites) assert.ok(completed.has(prerequisite), 'Prerequisites must precede lesson');
  assert.ok(lesson.copy.length >= 3 && lesson.sources.length > 0 && lesson.objective);
  assert.ok(lesson.challenge.reference_prompt.includes('{{input}}'));
  assert.equal(lesson.challenge.grader, 'line_set');
  assert.equal(lesson.challenge.hints.length, 3);
  assert.ok(lesson.challenge.cases.filter(item => item.visibility === 'held_out').length >= 2);
  for (const id of lesson.linked_prompt_ids) assert.ok(content.prompts.some(prompt => prompt.id === id && prompt.selected_for_starter));
  for (const testCase of lesson.challenge.cases) {
    assert.ok(!caseIds.has(testCase.id), 'Case IDs must be unique');
    caseIds.add(testCase.id);
    assert.ok(testCase.input && Array.isArray(testCase.expected));
    assert.ok(passes(testCase.expected.join('\n'), testCase.expected));
    assert.ok(passes([...testCase.expected].reverse().join('\r\n'), testCase.expected));
    assert.ok(!passes(testCase.expected.concat('UNREQUESTED EXTRA ITEM').join('\n'), testCase.expected));
    checks += 3;
    if (testCase.expected.length) {
      assert.ok(!passes(testCase.expected.slice(1).join('\n'), testCase.expected));
      assert.ok(!passes(testCase.expected.concat(testCase.expected[0]).join('\n'), testCase.expected));
      checks += 2;
    }
    cases++;
  }
  const practice = lesson.challenge.cases.find(item => item.visibility === 'practice');
  assert.ok(practice);
  for (const output of lesson.challenge.failure_outputs) {
    assert.ok(!passes(output, practice.expected), 'Known failure unexpectedly passed');
    checks++;
  }
  completed.add(lesson.id);
}

console.log(JSON.stringify({
  result: 'passed',
  prompts_preserved: content.prompts.length,
  starter_prompts: 5,
  lessons: curriculum.lessons.length,
  challenge_cases: cases,
  output_checks: checks,
  provider_calls: 0,
  scope: 'Content links, prerequisites, variable names, and authored output fixtures; no live-model calibration',
}, null, 2));
