CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     TEXT NOT NULL UNIQUE,
  github_login  TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  top_languages       TEXT[],
  experience_level    TEXT,
  contribution_types  TEXT[],
  weekly_hours        INT,
  purpose             TEXT,
  onboarding_done     BOOLEAN DEFAULT FALSE,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE bookmarks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_number        INT NOT NULL,
  repo_full_name      TEXT NOT NULL,
  issue_title         TEXT NOT NULL,
  issue_url           TEXT NOT NULL,
  contribution_type   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, repo_full_name, issue_number)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
