DROP INDEX IF EXISTS topic_progress_user_last_interaction_idx;

ALTER TABLE IF EXISTS topic_progress
    DROP COLUMN IF EXISTS last_interaction_at,
    DROP COLUMN IF EXISTS opened_at;
