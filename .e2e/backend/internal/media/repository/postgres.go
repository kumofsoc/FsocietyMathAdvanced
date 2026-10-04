package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/domain"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) Create(ctx context.Context, track domain.Track) (domain.Track, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.Track{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var lockedUser string
	if err := tx.QueryRow(ctx, `SELECT id::text FROM users WHERE id = $1 FOR UPDATE`, track.UserID).Scan(&lockedUser); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Track{}, ErrNotFound
		}
		return domain.Track{}, err
	}

	var count int
	var maxPosition int
	if err := tx.QueryRow(ctx, `
		SELECT count(*), COALESCE(max(position), -1)
		FROM media_audio_tracks
		WHERE user_id = $1
	`, track.UserID).Scan(&count, &maxPosition); err != nil {
		return domain.Track{}, err
	}
	if count >= domain.MaxTracksPerUser {
		return domain.Track{}, ErrTrackLimit
	}

	track.Position = maxPosition + 1
	row := tx.QueryRow(ctx, `
		INSERT INTO media_audio_tracks
			(id, user_id, display_name, mime_type, size_bytes, object_key, position)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id::text, user_id::text, display_name, mime_type, size_bytes, object_key, position, created_at, updated_at
	`, track.ID, track.UserID, track.DisplayName, track.MIMEType, track.SizeBytes, track.ObjectKey, track.Position)
	created, err := scanTrack(row)
	if err != nil {
		return domain.Track{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Track{}, err
	}
	return created, nil
}

func (p *Postgres) List(ctx context.Context, userID string) ([]domain.Track, error) {
	return listTracks(ctx, p.db, userID)
}

func (p *Postgres) Get(ctx context.Context, userID, id string) (domain.Track, error) {
	return scanTrack(p.db.QueryRow(ctx, `
		SELECT id::text, user_id::text, display_name, mime_type, size_bytes, object_key, position, created_at, updated_at
		FROM media_audio_tracks
		WHERE user_id = $1 AND id = $2
	`, userID, id))
}

func (p *Postgres) Rename(ctx context.Context, userID, id, name string) (domain.Track, error) {
	return scanTrack(p.db.QueryRow(ctx, `
		UPDATE media_audio_tracks
		SET display_name = $3, updated_at = now()
		WHERE user_id = $1 AND id = $2
		RETURNING id::text, user_id::text, display_name, mime_type, size_bytes, object_key, position, created_at, updated_at
	`, userID, id, name))
}

func (p *Postgres) Delete(ctx context.Context, userID, id string) (domain.Track, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.Track{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var lockedUser string
	if err := tx.QueryRow(ctx, `SELECT id::text FROM users WHERE id = $1 FOR UPDATE`, userID).Scan(&lockedUser); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Track{}, ErrNotFound
		}
		return domain.Track{}, err
	}

	deleted, err := scanTrack(tx.QueryRow(ctx, `
		DELETE FROM media_audio_tracks
		WHERE user_id = $1 AND id = $2
		RETURNING id::text, user_id::text, display_name, mime_type, size_bytes, object_key, position, created_at, updated_at
	`, userID, id))
	if err != nil {
		return domain.Track{}, err
	}

	if _, err := tx.Exec(ctx, `SET CONSTRAINTS media_audio_tracks_user_position_unique DEFERRED`); err != nil {
		return domain.Track{}, err
	}
	if _, err := tx.Exec(ctx, `
		UPDATE media_audio_tracks
		SET position = position - 1, updated_at = now()
		WHERE user_id = $1 AND position > $2
	`, userID, deleted.Position); err != nil {
		return domain.Track{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Track{}, err
	}
	return deleted, nil
}

func (p *Postgres) Reorder(ctx context.Context, userID string, ids []string) ([]domain.Track, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var lockedUser string
	if err := tx.QueryRow(ctx, `SELECT id::text FROM users WHERE id = $1 FOR UPDATE`, userID).Scan(&lockedUser); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	rows, err := tx.Query(ctx, `
		SELECT id::text
		FROM media_audio_tracks
		WHERE user_id = $1
		ORDER BY position, id
		FOR UPDATE
	`, userID)
	if err != nil {
		return nil, err
	}
	current := make([]string, 0, domain.MaxTracksPerUser)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			return nil, err
		}
		current = append(current, id)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}
	rows.Close()

	if !sameIDSet(current, ids) {
		return nil, ErrOrderConflict
	}
	if _, err := tx.Exec(ctx, `SET CONSTRAINTS media_audio_tracks_user_position_unique DEFERRED`); err != nil {
		return nil, err
	}
	for position, id := range ids {
		id = strings.ToLower(strings.TrimSpace(id))
		tag, err := tx.Exec(ctx, `
			UPDATE media_audio_tracks
			SET position = $3, updated_at = now()
			WHERE user_id = $1 AND id = $2
		`, userID, id, position)
		if err != nil {
			return nil, err
		}
		if tag.RowsAffected() != 1 {
			return nil, ErrOrderConflict
		}
	}

	out, err := listTracks(ctx, tx, userID)
	if err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return out, nil
}

type rowScanner interface {
	Scan(...any) error
}

type queryer interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

func scanTrack(row rowScanner) (domain.Track, error) {
	var track domain.Track
	err := row.Scan(
		&track.ID,
		&track.UserID,
		&track.DisplayName,
		&track.MIMEType,
		&track.SizeBytes,
		&track.ObjectKey,
		&track.Position,
		&track.CreatedAt,
		&track.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Track{}, ErrNotFound
	}
	if err != nil {
		return domain.Track{}, err
	}
	return track, nil
}

func listTracks(ctx context.Context, q queryer, userID string) ([]domain.Track, error) {
	rows, err := q.Query(ctx, `
		SELECT id::text, user_id::text, display_name, mime_type, size_bytes, object_key, position, created_at, updated_at
		FROM media_audio_tracks
		WHERE user_id = $1
		ORDER BY position, created_at, id
		LIMIT $2
	`, userID, domain.MaxTracksPerUser+1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tracks := make([]domain.Track, 0)
	for rows.Next() {
		track, err := scanTrack(rows)
		if err != nil {
			return nil, err
		}
		tracks = append(tracks, track)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return tracks, nil
}

func sameIDSet(current, requested []string) bool {
	if len(current) != len(requested) {
		return false
	}
	seen := make(map[string]struct{}, len(requested))
	for _, id := range requested {
		canonical := strings.ToLower(strings.TrimSpace(id))
		if _, exists := seen[canonical]; exists {
			return false
		}
		seen[canonical] = struct{}{}
	}
	for _, id := range current {
		canonical := strings.ToLower(strings.TrimSpace(id))
		if _, exists := seen[canonical]; !exists {
			return false
		}
	}
	return true
}
