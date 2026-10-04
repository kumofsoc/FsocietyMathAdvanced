CREATE TABLE media_audio_tracks (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name varchar(255) NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 255),
    mime_type varchar(100) NOT NULL CHECK (
        mime_type IN (
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/flac',
            'audio/mp4',
            'audio/webm',
            'audio/aac'
        )
    ),
    size_bytes bigint NOT NULL CHECK (size_bytes BETWEEN 1 AND 125829120),
    object_key varchar(128) NOT NULL UNIQUE CHECK (object_key ~ '^[0-9a-f]{64}$'),
    position integer NOT NULL CHECK (position >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT media_audio_tracks_user_position_unique
        UNIQUE (user_id, position)
        DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX media_audio_tracks_user_order_idx
    ON media_audio_tracks(user_id, position, created_at, id);
