ALTER TABLE topic_progress
    ADD COLUMN opened_at timestamptz NULL,
    ADD COLUMN last_interaction_at timestamptz NULL;

UPDATE topic_progress
SET opened_at = COALESCE(opened_at, created_at),
    last_interaction_at = COALESCE(last_interaction_at, updated_at);

ALTER TABLE topic_progress
    ALTER COLUMN last_interaction_at SET NOT NULL;

CREATE INDEX topic_progress_user_last_interaction_idx
    ON topic_progress(user_id, last_interaction_at DESC);
