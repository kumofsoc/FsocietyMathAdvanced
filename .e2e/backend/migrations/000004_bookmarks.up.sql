CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE saved_theorems
    ADD COLUMN id uuid,
    ADD COLUMN kind text NOT NULL DEFAULT 'theorem',
    ADD COLUMN title text NOT NULL DEFAULT 'Saved theorem',
    ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

UPDATE saved_theorems
SET id = gen_random_uuid()
WHERE id IS NULL;

UPDATE saved_theorems
SET title = theorem_id,
    updated_at = saved_at;

UPDATE saved_theorems
SET topic_id = split_part(theorem_id, '::', 1)
WHERE topic_id IS NULL
  AND position('::' in theorem_id) > 1;

ALTER TABLE saved_theorems
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN id SET NOT NULL;

ALTER TABLE saved_theorems
    ADD CONSTRAINT saved_theorems_id_key UNIQUE (id),
    ADD CONSTRAINT saved_theorems_kind_valid CHECK (
        btrim(kind) <> '' AND octet_length(kind) BETWEEN 1 AND 32
    ),
    ADD CONSTRAINT saved_theorems_title_valid CHECK (
        btrim(title) <> '' AND octet_length(title) BETWEEN 1 AND 300
    );

CREATE INDEX saved_theorems_user_created_idx
    ON saved_theorems(user_id, saved_at DESC, id);
