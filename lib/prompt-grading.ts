import type { ExerciseRule, PromptExercise, PromptGrade, PublicExercise } from "./exercise-types";

const normalize = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/\bdon't\b/g, "do not").replace(/\bcan't\b/g, "cannot").replace(/\bdoesn't\b/g, "does not").replace(/\bwon't\b/g, "will not").replace(/\bcouldn't\b/g, "could not").replace(/\bdo not forget to\b/g, "").replace(/[\t ]+/g, " ");
const negated = (text: string, index: number) => /\b(no|not|never|cannot|without|avoid|skip|prevent)\b/.test(text.slice(0, index).split(/\s+/).slice(-5).join(" "));
const positive = (text: string, pattern: RegExp) => {
  for (const match of text.matchAll(new RegExp(pattern.source, "g"))) if (!negated(text, match.index)) return true;
  return false;
};
const report = /\b(show|report|list|summari[sz]e|include|tell|return|share|flag|note|identify|explain)\b/;
const publish = /\b(publish\w*|post\w*|go live|going live)\b/;
const approval = /\b(approv\w*|permission|consent|confirm\w*|sign off)\b/;

function evaluate(rule: ExerciseRule, answer: string): boolean {
  const clauses = answer.split(/[.!?;\n,]+/).map(clause => clause.trim()).filter(Boolean);
  const some = (pattern: RegExp) => clauses.some(clause => positive(clause, pattern));
  switch (rule) {
    case "project-progress":
      return some(/\b(view|see|track|check|monitor|browse|follow|show)\b.{0,85}\b(projects?|progress|status|milestones?|work)\b/);
    case "client-feedback":
      return some(/\b(leave|send|share|give|add|write|post|provide|submit)\b.{0,65}\b(feedback|comments?|notes|suggestions)\b/) || some(/\bcomment on\b/);
    case "client-approval":
      return some(/\b(approve|accept|sign off|authorize|authorise)\b/) || some(/\b(give|grant|provide)\b.{0,30}\bapproval\b/);
    case "draft-persistence": {
      const drafts = /\bdrafts?\b/.test(answer);
      const durable = /\b(refresh\w*|reload\w*|reopen\w*|return\w*|between (?:visits|sessions)|next visit|come back|close\w*|closing|restart\w*)\b/.test(answer);
      const preserve = some(/\b(save|autosave|keep|store|persist|retain|preserve)\b.{0,65}\bdrafts?\b/) || clauses.some(clause => /\b(do not|never|cannot|must not)\b.{0,35}\b(lose|delete|erase|discard)\b.{0,35}\bdrafts?\b/.test(clause));
      const passivePreserve = some(/\bdrafts?\b.{0,30}\b(?:must|should|will)\b.{0,15}\b(?:stay|remain|be)\b.{0,15}\b(?:saved|stored|available)\b/);
      const destructive = some(/\b(delete|discard|erase|lose|clear|wipe)\b.{0,35}\bdrafts?\b/);
      return drafts && durable && (preserve || passivePreserve) && !destructive;
    }
    case "publishing-permission": {
      const relevant = clauses.filter(clause => publish.test(clause) && approval.test(clause));
      const unsafe = relevant.some(clause => positive(clause, /\b(publish\w*|post\w*|go live)\b.{0,50}\bwithout\b.{0,35}\b(approval|permission|consent|confirmation)\b/) || /\b(does not|do not|never)\b.{0,20}\b(require|need|ask)\b/.test(clause));
      return !unsafe && relevant.some(clause => {
        const blockUntil = /\b(never|not|cannot|block|prevent|stop)\b.{0,35}\b(publish\w*|post\w*|go live)\b.{0,50}\b(without|until|before)\b/.test(clause);
        const onlyAfter = /\bonly\b.{0,30}\b(publish\w*|post\w*|go live)\b.{0,25}\b(after|once|when|with)\b/.test(clause);
        const passiveOnlyAfter = /\b(publish\w*|post\w*)\b.{0,20}\bonly\b.{0,25}\b(after|once|when|with)\b/.test(clause) && !/\bnot\b.{0,15}\bonly\b/.test(clause);
        const requireFirst = positive(clause, /\b(ask|require|obtain|get|wait)\b.{0,80}\b(approv\w*|permission|consent|confirm\w*)\b/) && /\b(before|first|until|to publish|to post)\b/.test(clause);
        return blockUntil || onlyAfter || passiveOnlyAfter || requireFirst;
      });
    }
    case "test-user-flow":
      return some(/\b(test|try|verify|check|exercise)\b.{0,90}\b(sign(?:ing)? in|log(?:ging)? in|login|sign(?:ing)? up|sav(?:e|ing) (?:a |the |my )?draft|creat(?:e|ing) (?:a |the |my )?project|add(?:ing)? (?:a |the )?task|upload(?:ing)? (?:a |the )?file)\b/);
    case "report-results":
      return clauses.some(clause => positive(clause, new RegExp(report.source + ".{0,90}\\b(results?|outcomes?|passed|failed|failures)\\b"))) && !some(/\b(hide|ignore|omit)\b.{0,40}\b(results?|outcomes?|failed|failures)\b/);
    case "report-gaps":
      return clauses.some(clause => positive(clause, new RegExp(report.source + ".{0,110}\\b(untested|unchecked|unverified|skipped|not test\\w*|not check\\w*|not verif\\w*|cannot verif\\w*|unable to verif\\w*)\\b"))) && !some(/\b(hide|ignore|omit)\b.{0,50}\b(untested|unchecked|unverified|skipped|gaps)\b/);
  }
}

export function publicExercise(exercise: PromptExercise): PublicExercise {
  return { kind: exercise.kind, goal: exercise.goal, prefix: exercise.prefix, suffix: exercise.suffix, placeholder: exercise.placeholder, hints: exercise.hints, criteria: exercise.criteria.map(({ id, label }) => ({ id, label })) };
}

export function gradePrompt(exercise: PromptExercise, answer: string): PromptGrade {
  const normalized = normalize(answer.trim());
  const words = normalized.split(/\s+/).filter(Boolean).length;
  const invalid = answer.length > 2000 ? "Keep the missing part under 2,000 characters." : words < 4 ? "Write a short instruction in your own words, then check it." : /\[.*(?:answer|blank|write).*\]|\{\{/.test(normalized) ? "Replace the blank with your own instructions." : null;
  const checks = exercise.criteria.map(criterion => {
    const passed = !invalid && evaluate(criterion.rule, normalized);
    return { id: criterion.id, label: criterion.label, passed, feedback: passed ? "Included in your prompt." : criterion.hint };
  });
  const passed = checks.length > 0 && checks.every(check => check.passed);
  return { passed, message: invalid ?? (passed ? exercise.explanation : "Good start. Add the missing instructions, then try again."), checks };
}
