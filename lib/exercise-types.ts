export const exerciseRules = [
  { id: "project-progress", label: "Let clients view project progress" },
  { id: "client-feedback", label: "Let clients leave feedback" },
  { id: "client-approval", label: "Let clients approve work" },
  { id: "draft-persistence", label: "Keep drafts after reload" },
  { id: "publishing-permission", label: "Require approval before publishing" },
  { id: "test-user-flow", label: "Test a specific user flow" },
  { id: "report-results", label: "Report test results" },
  { id: "report-gaps", label: "Report anything not checked" },
] as const;
export type ExerciseRule = typeof exerciseRules[number]["id"];
export type ExerciseCriterion = { id: string; label: string; rule: ExerciseRule; hint: string };
export type PromptExercise = {
  kind: "prompt-completion"; goal: string; prefix: string; suffix: string;
  placeholder: string; hints: string[]; criteria: ExerciseCriterion[];
  referenceAnswer: string; explanation: string;
};
export type PublicExercise = Pick<PromptExercise, "kind" | "goal" | "prefix" | "suffix" | "placeholder" | "hints"> & {
  criteria: Pick<ExerciseCriterion, "id" | "label">[];
};
export type PromptGrade = {
  passed: boolean; message: string;
  checks: { id: string; label: string; passed: boolean; feedback: string }[];
};
