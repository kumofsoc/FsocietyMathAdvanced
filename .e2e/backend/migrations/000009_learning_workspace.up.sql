CREATE TABLE saved_topics (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id varchar(128) NOT NULL CHECK (
        topic_id = btrim(topic_id)
        AND octet_length(topic_id) BETWEEN 1 AND 128
    ),
    saved_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE topic_resume_positions (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id varchar(128) NOT NULL CHECK (
        topic_id = btrim(topic_id)
        AND octet_length(topic_id) BETWEEN 1 AND 128
    ),
    block_index integer NOT NULL CHECK (block_index >= 0),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE user_workspace_settings (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    reading_width varchar(16) NOT NULL DEFAULT 'normal'
        CHECK (reading_width IN ('narrow', 'normal', 'wide')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX saved_topics_user_saved_idx
    ON saved_topics(user_id, saved_at DESC, topic_id);

CREATE INDEX topic_resume_positions_user_updated_idx
    ON topic_resume_positions(user_id, updated_at DESC, topic_id);
