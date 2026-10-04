ALTER TABLE media_audio_tracks
    DROP CONSTRAINT IF EXISTS media_audio_tracks_mime_type_check;

ALTER TABLE media_audio_tracks
    ADD CONSTRAINT media_audio_tracks_mime_type_check
    CHECK (
        mime_type IN (
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/flac',
            'audio/mp4',
            'audio/webm',
            'audio/aac'
        )
    );
