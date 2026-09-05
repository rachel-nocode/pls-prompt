-- Rehearsal only. Generate a new Drizzle migration during Phase 1.
ALTER TABLE prompts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'public'));
ALTER TABLE prompts ADD COLUMN access_mode TEXT NOT NULL DEFAULT 'free'
  CHECK (access_mode IN ('free', 'earned_or_paid'));

CREATE UNIQUE INDEX idx_prompt_saves_user_prompt ON prompt_saves(user_id, prompt_id);

CREATE TABLE collections (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, user_id)
);
CREATE INDEX idx_collections_user_updated ON collections(user_id, updated_at);

CREATE TABLE collection_prompts (
  collection_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (collection_id, prompt_id),
  FOREIGN KEY (collection_id, user_id) REFERENCES collections(id, user_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, prompt_id) REFERENCES prompt_saves(user_id, prompt_id) ON DELETE CASCADE
);
CREATE INDEX idx_collection_prompts_user_prompt ON collection_prompts(user_id, prompt_id);

CREATE TABLE prompt_versions (
  id TEXT PRIMARY KEY NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  version INTEGER NOT NULL CHECK (version > 0),
  prompt_text TEXT,
  github_url TEXT,
  asset_key TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (prompt_id, version)
);
