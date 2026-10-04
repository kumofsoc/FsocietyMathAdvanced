CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
    id uuid PRIMARY KEY,
    email citext NOT NULL UNIQUE,
    password_hash text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    handle citext NOT NULL UNIQUE,
    display_name varchar(80) NOT NULL,
    bio varchar(500) NOT NULL DEFAULT '',
    avatar_url text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT profiles_handle_format CHECK (handle ~ '^[a-z0-9][a-z0-9_-]{2,29}$')
);

CREATE TABLE sessions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_agent varchar(512) NOT NULL DEFAULT '',
    ip_address varchar(64) NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL,
    last_seen_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz NULL,
    CHECK (expires_at > created_at)
);

CREATE INDEX sessions_user_active_idx
    ON sessions(user_id, expires_at)
    WHERE revoked_at IS NULL;

CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    token_hash bytea NOT NULL UNIQUE CHECK (octet_length(token_hash) = 32),
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz NULL,
    revoked_at timestamptz NULL,
    replaced_by uuid NULL REFERENCES refresh_tokens(id),
    CHECK (expires_at > created_at)
);

CREATE INDEX refresh_tokens_session_idx ON refresh_tokens(session_id);
CREATE INDEX refresh_tokens_expiry_idx ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;
