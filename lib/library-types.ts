import type { PromptRecord } from "./content";
import type { PublicExercise } from "./exercise-types";

export type PromptSummary = Pick<PromptRecord, "id" | "slug" | "title" | "promise" | "category" | "tags" | "difficulty" | "models" | "verified" | "quality_score" | "tested_at"> & { access_mode?: string; version?: number };
export type Actor = { id: string; displayName: string; isCreator: boolean };
export type LibraryItem = {
  id: string; user_id: string; prompt_id: string | null; title: string; prompt_text: string;
  source_url: string | null; tags: string; notes: string; source: string; version: number;
  recipe_snapshot?: string | null; source_recipe_version?: string | null;
  archived_at: string | null; created_at: string; updated_at: string;
};
export type Collection = { id: string; user_id: string; title: string; created_at: string };
export type LibraryVersion = { id: string; item_id: string; user_id: string; version: number; snapshot: string; created_at: string };
export type LibraryData = { items: LibraryItem[]; collections: Collection[]; memberships: { collection_id: string; item_id: string }[] };
export type QuickCheck = { question: string; options: { id: string; text: string }[]; correct: string; explanation: string };
export type PublicLesson = {
  id: string; slug: string; title: string; eyebrow: string; summary: string; body: string;
  level: string; minutes: number; position: number; prerequisite_id: string | null;
  reward_prompt_id: string | null; version: number; published: number;
  exercise: PublicExercise | null;
  reward_title: string | null; reward_promise: string | null;
  created_at: string; updated_at: string;
};
export type ItemInput = { recipe?: import("./recipe-types").Recipe | null; title: string; promptText: string; notes: string; tags: string[] };
