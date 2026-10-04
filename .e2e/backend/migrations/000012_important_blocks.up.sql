CREATE TABLE important_blocks (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id varchar(128) NOT NULL CHECK (
        topic_id = btrim(topic_id)
        AND octet_length(topic_id) BETWEEN 1 AND 128
    ),
    block_index integer NOT NULL CHECK (block_index >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic_id, block_index)
);

CREATE INDEX important_blocks_user_updated_idx
    ON important_blocks(user_id, updated_at ASC, topic_id, block_index);
