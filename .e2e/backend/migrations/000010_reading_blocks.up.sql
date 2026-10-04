CREATE TABLE reading_blocks (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id text NOT NULL,
    block_index integer NOT NULL CHECK (block_index >= 0),
    read_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic_id, block_index),
    CONSTRAINT reading_blocks_topic_id_valid CHECK (
        topic_id = btrim(topic_id)
        AND octet_length(topic_id) BETWEEN 1 AND 128
        AND topic_id !~ '[^A-Za-z0-9_.:-]'
    )
);

CREATE INDEX reading_blocks_user_topic_idx
    ON reading_blocks(user_id, topic_id, block_index);
