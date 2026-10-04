CREATE TABLE activity_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    entity_id text NULL,
    topic_id text NULL,
    occurred_at timestamptz NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT activity_events_type_valid CHECK (
        event_type IN (
            'topic_opened',
            'theory_completed',
            'exercise_solved',
            'bookmark_added',
            'session_started'
        )
    ),
    CONSTRAINT activity_events_entity_id_valid CHECK (
        entity_id IS NULL OR (
            btrim(entity_id) <> '' AND octet_length(entity_id) <= 192
        )
    ),
    CONSTRAINT activity_events_topic_id_valid CHECK (
        topic_id IS NULL OR (
            btrim(topic_id) <> '' AND octet_length(topic_id) <= 128
        )
    )
);

CREATE INDEX activity_events_user_occurred_idx
    ON activity_events(user_id, occurred_at DESC);

CREATE INDEX activity_events_user_type_occurred_idx
    ON activity_events(user_id, event_type, occurred_at DESC);
