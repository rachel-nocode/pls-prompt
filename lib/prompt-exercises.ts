import type { PromptExercise } from "./exercise-types";

export const promptExercises: Record<string, PromptExercise> = {
  "lesson-outcomes": {
    kind: "prompt-completion",
    goal: "Give a client portal three clear jobs: show project progress, collect feedback, and get work approved.",
    prefix: "Build a client portal for my design studio. Clients should be able to",
    suffix: "Keep the experience simple enough for a first-time client.",
    placeholder: "Finish the sentence with what clients can do…",
    hints: ["Use action words: what can a client actually do?", "Cover all three jobs in the goal. A short list is fine.", "Make each action something you could try in the finished app."],
    criteria: [
      { id: "progress", label: "Clients can view project progress", rule: "project-progress", hint: "Add a way for clients to see how their project is going." },
      { id: "feedback", label: "Clients can leave feedback", rule: "client-feedback", hint: "Say how clients can send comments or feedback." },
      { id: "approval", label: "Clients can approve work", rule: "client-approval", hint: "Include an action for accepting a finished deliverable." },
    ],
    referenceAnswer: "view project progress, leave feedback, and approve completed work.",
    explanation: "You named three actions someone can try. That gives the AI a clear finish line.",
  },
  "lesson-constraints": {
    kind: "prompt-completion",
    goal: "Keep a creator's drafts safe after refreshing the page, and make publishing wait for their approval.",
    prefix: "Build a content planner for a solo creator. Follow these two rules:",
    suffix: "Build the smallest version that follows both rules.",
    placeholder: "Write the two rules in your own words…",
    hints: ["Think about what should happen after a page refresh.", "Who decides when a draft becomes a published post?", "Avoid vague rules such as ‘be reliable.’ Name behavior you can check."],
    criteria: [
      { id: "drafts", label: "Drafts survive a page refresh", rule: "draft-persistence", hint: "Explain that saved drafts must still be there after reload or reopening." },
      { id: "permission", label: "Publishing needs the creator's approval", rule: "publishing-permission", hint: "Make approval a requirement before anything goes live." },
    ],
    referenceAnswer: "Save my drafts so they survive a page refresh. Never publish a post without my approval.",
    explanation: "Both rules describe behavior you can test: reload a draft, then check that publishing waits for permission.",
  },
  "lesson-proof": {
    kind: "prompt-completion",
    goal: "Ask an AI builder to test a real app flow, report what passed or failed, and name anything it could not check.",
    prefix: "Before you tell me the app is finished,",
    suffix: "Use that evidence to explain whether the app is ready.",
    placeholder: "Write what the builder should test and report…",
    hints: ["Name something a person would do, such as signing in or saving a draft.", "Ask for the outcome of the tests, not just a promise that tests ran.", "Make room for gaps: what was skipped, unavailable, or still untested?"],
    criteria: [
      { id: "flow", label: "A specific user flow gets tested", rule: "test-user-flow", hint: "Request a test of a concrete action, such as signing in or saving a draft." },
      { id: "results", label: "Test results are reported", rule: "report-results", hint: "Ask to see which checks passed or failed, or their results." },
      { id: "gaps", label: "Untested work stays visible", rule: "report-gaps", hint: "Ask the builder to list anything it could not verify." },
    ],
    referenceAnswer: "test signing in and saving a draft. Report which checks passed or failed, and list anything you could not verify.",
    explanation: "A tested flow, its results, and visible gaps give you evidence to inspect instead of confidence alone.",
  },
};
