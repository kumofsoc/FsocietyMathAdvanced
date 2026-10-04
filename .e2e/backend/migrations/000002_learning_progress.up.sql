CREATE TABLE learning_state (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_topic_id text NULL,
    revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
    client_updated_at timestamptz NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT learning_state_last_topic_id_valid CHECK (
        last_topic_id IS NULL OR (
            btrim(last_topic_id) <> '' AND
            octet_length(last_topic_id) BETWEEN 1 AND 128
        )
    )
);

CREATE TABLE topic_progress (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id text NOT NULL,
    reading_ratio double precision NOT NULL DEFAULT 0,
    theory_completed_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic_id),
    CONSTRAINT topic_progress_topic_id_valid CHECK (
        btrim(topic_id) <> '' AND octet_length(topic_id) BETWEEN 1 AND 128
    ),
    CONSTRAINT topic_progress_reading_ratio_valid CHECK (
        reading_ratio >= 0 AND reading_ratio <= 1
    )
);

CREATE TABLE exercise_progress (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id text NOT NULL,
    topic_id text NULL,
    solved_at timestamptz NOT NULL,
    PRIMARY KEY (user_id, task_id),
    CONSTRAINT exercise_progress_task_id_valid CHECK (
        btrim(task_id) <> '' AND octet_length(task_id) BETWEEN 1 AND 128
    ),
    CONSTRAINT exercise_progress_topic_id_valid CHECK (
        topic_id IS NULL OR (
            btrim(topic_id) <> '' AND octet_length(topic_id) BETWEEN 1 AND 128
        )
    )
);

CREATE TABLE saved_theorems (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theorem_id text NOT NULL,
    topic_id text NULL,
    saved_at timestamptz NOT NULL,
    PRIMARY KEY (user_id, theorem_id),
    CONSTRAINT saved_theorems_theorem_id_valid CHECK (
        btrim(theorem_id) <> '' AND octet_length(theorem_id) BETWEEN 1 AND 192
    ),
    CONSTRAINT saved_theorems_topic_id_valid CHECK (
        topic_id IS NULL OR (
            btrim(topic_id) <> '' AND octet_length(topic_id) BETWEEN 1 AND 128
        )
    )
);

CREATE INDEX topic_progress_user_updated_idx
    ON topic_progress(user_id, updated_at DESC);

CREATE INDEX exercise_progress_user_solved_idx
    ON exercise_progress(user_id, solved_at DESC);

CREATE INDEX saved_theorems_user_saved_idx
    ON saved_theorems(user_id, saved_at DESC);
