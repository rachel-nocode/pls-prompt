export type PromptRecord = {
  id: string;
  slug: string;
  title: string;
  promise: string;
  prompt_text: string | null;
  github_url: string | null;
  asset_key: string | null;
  category: string;
  tags: string;
  difficulty: string;
  models: string;
  anatomy: string;
  example_output: string | null;
  verified: number;
  quality_score: number;
  author_id: string;
  author_name: string;
  status: string;
  tested_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonRecord = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  body: string;
  level: string;
  minutes: number;
  published: number;
  created_at: string;
  updated_at: string;
};

export const seedPrompts: PromptRecord[] = [
  {
    id: "prompt-product-spec",
    slug: "turn-an-idea-into-a-product-spec",
    title: "Turn an idea into a product spec",
    promise: "Go from fuzzy concept to a buildable scope with decisions, edge cases, and acceptance criteria.",
    prompt_text: `You are a senior product engineer helping me turn an idea into a buildable product specification.\n\nIDEA\n{{idea}}\n\nTARGET USER\n{{target_user}}\n\nCONSTRAINTS\n{{constraints}}\n\nCreate: (1) a one-paragraph product definition, (2) the primary user journey, (3) MVP requirements, (4) non-goals, (5) edge cases, (6) acceptance criteria, and (7) the five decisions I must make before coding. Ask no more than three questions only if a missing answer would materially change the architecture.`,
    github_url: null,
    asset_key: null,
    category: "Code",
    tags: JSON.stringify(["product", "planning", "vibe coding"]),
    difficulty: "Beginner",
    models: JSON.stringify(["ChatGPT", "Claude", "Gemini"]),
    anatomy: JSON.stringify([
      { label: "Role", text: "A senior product engineer sets the quality bar." },
      { label: "Context", text: "The idea, audience, and constraints prevent generic advice." },
      { label: "Format", text: "Seven explicit outputs make the answer immediately usable." },
    ]),
    example_output: "A scoped feature map, critical edge cases, and testable acceptance criteria ready for implementation.",
    verified: 1,
    quality_score: 94,
    author_id: "plsprompt-team",
    author_name: "PlsPrompt Team",
    status: "published",
    tested_at: "2026-08-28",
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-28T10:00:00Z",
  },
  {
    id: "prompt-bug-hunt",
    slug: "hunt-a-bug-like-a-senior-qa",
    title: "Hunt a bug like a senior QA",
    promise: "Turn a messy failure into ranked hypotheses, targeted checks, and a clean bug report.",
    prompt_text: `Act as a senior QA engineer. Analyze the failure below without guessing beyond the evidence.\n\nEXPECTED\n{{expected}}\n\nACTUAL\n{{actual}}\n\nENVIRONMENT\n{{environment}}\n\nEVIDENCE\n{{evidence}}\n\nReturn: likely causes ranked by confidence, the smallest diagnostic test for each cause, missing evidence, regression risk, and a concise bug report. Clearly label facts, assumptions, and unknowns.`,
    github_url: null,
    asset_key: null,
    category: "Code",
    tags: JSON.stringify(["QA", "debugging", "testing"]),
    difficulty: "Intermediate",
    models: JSON.stringify(["ChatGPT", "Claude"]),
    anatomy: JSON.stringify([
      { label: "Evidence", text: "Expected, actual, environment, and logs keep the diagnosis grounded." },
      { label: "Constraint", text: "Facts and assumptions must be separated." },
      { label: "Outcome", text: "The response ends with a bug report, not a wall of theories." },
    ]),
    example_output: "A confidence-ranked investigation plan and a reproduction-ready defect report.",
    verified: 1,
    quality_score: 97,
    author_id: "plsprompt-team",
    author_name: "PlsPrompt Team",
    status: "published",
    tested_at: "2026-09-01",
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "prompt-deep-research",
    slug: "research-without-the-confident-nonsense",
    title: "Research without the confident nonsense",
    promise: "Produce an evidence-backed brief that separates sources, inference, and uncertainty.",
    prompt_text: `Research this question: {{question}}\n\nThe decision this research supports: {{decision}}\nTime range: {{time_range}}\nPreferred sources: {{preferred_sources}}\n\nUse primary sources where possible. Separate verified facts from inference. For every important claim, include a source and date. Call out conflicting evidence and information that may be outdated. Finish with a recommendation, confidence level, and the next three checks that would reduce uncertainty most.`,
    github_url: null,
    asset_key: null,
    category: "Research",
    tags: JSON.stringify(["research", "sources", "decision making"]),
    difficulty: "Intermediate",
    models: JSON.stringify(["ChatGPT", "Gemini"]),
    anatomy: JSON.stringify([
      { label: "Goal", text: "The decision gives the research a practical purpose." },
      { label: "Proof", text: "Sources and dates make claims auditable." },
      { label: "Uncertainty", text: "Conflicts and missing evidence remain visible." },
    ]),
    example_output: "A decision-ready brief with dated sources, conflicts, confidence, and next checks.",
    verified: 1,
    quality_score: 92,
    author_id: "plsprompt-team",
    author_name: "PlsPrompt Team",
    status: "published",
    tested_at: "2026-08-30",
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-30T10:00:00Z",
  },
  {
    id: "prompt-github-agent",
    slug: "github-repository-onboarding-agent",
    title: "GitHub repository onboarding agent",
    promise: "Map an unfamiliar codebase, find its risky seams, and propose the safest first change.",
    prompt_text: null,
    github_url: "https://github.com/openai/openai-cookbook",
    asset_key: null,
    category: "Code",
    tags: JSON.stringify(["GitHub", "codebase", "agents"]),
    difficulty: "Advanced",
    models: JSON.stringify(["Codex", "Claude Code"]),
    anatomy: JSON.stringify([
      { label: "External source", text: "The maintained prompt lives with the repository it describes." },
      { label: "Storage", text: "PlsPrompt stores metadata and verification, not duplicated repository files." },
    ]),
    example_output: "A codebase map, risk register, and narrowly scoped implementation plan.",
    verified: 0,
    quality_score: 86,
    author_id: "plsprompt-team",
    author_name: "PlsPrompt Team",
    status: "published",
    tested_at: "2026-08-21",
    created_at: "2026-08-21T10:00:00Z",
    updated_at: "2026-08-21T10:00:00Z",
  },
  {
    id: "prompt-human-writing",
    slug: "make-this-sound-like-a-person",
    title: "Make this sound like a person",
    promise: "Rewrite stiff AI copy without sanding away the author's actual personality.",
    prompt_text: `Rewrite the draft below so it sounds like a thoughtful human with a clear point of view.\n\nDRAFT\n{{draft}}\n\nAUDIENCE\n{{audience}}\n\nVOICE NOTES\n{{voice_notes}}\n\nPreserve every factual claim and the author's intent. Remove filler, repetition, fake enthusiasm, generic transitions, and unexplained jargon. Vary sentence rhythm. Do not invent personal stories. Return the revision followed by five short notes explaining the most important edits.`,
    github_url: null,
    asset_key: null,
    category: "Writing",
    tags: JSON.stringify(["editing", "voice", "content"]),
    difficulty: "Beginner",
    models: JSON.stringify(["ChatGPT", "Claude", "Gemini"]),
    anatomy: JSON.stringify([
      { label: "Preserve", text: "Facts and intent stay intact." },
      { label: "Remove", text: "Specific failure modes replace vague requests to sound human." },
      { label: "Explain", text: "Edit notes teach the user what changed." },
    ]),
    example_output: "A cleaner draft with stronger rhythm and a short editorial rationale.",
    verified: 1,
    quality_score: 91,
    author_id: "plsprompt-team",
    author_name: "PlsPrompt Team",
    status: "published",
    tested_at: "2026-08-29",
    created_at: "2026-08-25T10:00:00Z",
    updated_at: "2026-08-29T10:00:00Z",
  },
  {
    id: "prompt-campaign",
    slug: "one-idea-five-useful-posts",
    title: "One idea, five useful posts",
    promise: "Turn one real insight into a small content series without repeating the same hook five times.",
    prompt_text: `Turn this insight into five distinct social posts: {{insight}}\n\nAudience: {{audience}}\nProof or experience I can cite: {{proof}}\nVoice: {{voice}}\n\nEach post must teach a different angle. Use a strong first line, one concrete example, and one useful takeaway. Avoid engagement bait, fake controversy, and unsupported metrics. Label the purpose of each post before the draft.`,
    github_url: null,
    asset_key: null,
    category: "Marketing",
    tags: JSON.stringify(["social", "content", "repurposing"]),
    difficulty: "Beginner",
    models: JSON.stringify(["ChatGPT", "Claude"]),
    anatomy: JSON.stringify([
      { label: "Source", text: "One true insight anchors the whole series." },
      { label: "Variation", text: "Each post must earn its own angle." },
      { label: "Boundary", text: "No invented proof or empty engagement tactics." },
    ]),
    example_output: "Five posts with distinct jobs: teach, challenge, demonstrate, reflect, and invite action.",
    verified: 1,
    quality_score: 90,
    author_id: "plsprompt-team",
    author_name: "PlsPrompt Team",
    status: "published",
    tested_at: "2026-08-27",
    created_at: "2026-08-26T10:00:00Z",
    updated_at: "2026-08-27T10:00:00Z",
  },
];

export const seedLessons: LessonRecord[] = [
  {
    id: "lesson-outcomes",
    slug: "start-with-the-outcome",
    title: "Start with the outcome, not the role",
    eyebrow: "Prompting 101",
    summary: "A fancy persona cannot rescue a prompt that never says what success looks like.",
    body: `A role can help set perspective, but the outcome does the real work. Describe what should exist when the model is finished. Make it observable: a plan with acceptance criteria, a table with cited sources, or code that passes a named test.\n\nWeak: “Act as an expert developer and help with my app.”\n\nStronger: “Review this checkout flow and return the three highest-risk failure paths, a test for each, and the smallest safe fix.”\n\nWhen the output can be checked, both the model and the user have a shared definition of done.`,
    level: "Beginner", minutes: 4, published: 1,
    created_at: "2026-08-20T10:00:00Z", updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "lesson-constraints",
    slug: "constraints-are-not-negativity",
    title: "Constraints are not negativity",
    eyebrow: "Better boundaries",
    summary: "Tell the model what must stay true, what it may change, and where it should stop.",
    body: `Constraints shrink the space of possible answers. That is useful. Name the required format, protected facts, unavailable tools, time limit, and actions the model must not take.\n\nGood constraints are relevant and testable. “Do not be bad” is noise. “Do not change the public API” gives the model a real boundary.\n\nAdd constraints after the goal, then remove any that do not affect the result.`,
    level: "Beginner", minutes: 5, published: 1,
    created_at: "2026-08-22T10:00:00Z", updated_at: "2026-08-22T10:00:00Z",
  },
  {
    id: "lesson-proof",
    slug: "ask-for-proof-not-confidence",
    title: "Ask for proof, not confidence",
    eyebrow: "Trust layer",
    summary: "Confident wording is not evidence. Design the response so important claims can be checked.",
    body: `Ask for sources, dates, calculations, test output, or direct observations depending on the task. Require the model to separate facts from inference and to say what it could not verify.\n\nFor code, request a test and the expected result. For research, request a source beside each important claim. For strategy, ask which assumptions would change the recommendation.\n\nThe goal is not a timid answer. It is an answer whose confidence matches its evidence.`,
    level: "Intermediate", minutes: 6, published: 1,
    created_at: "2026-08-24T10:00:00Z", updated_at: "2026-08-24T10:00:00Z",
  },
];

