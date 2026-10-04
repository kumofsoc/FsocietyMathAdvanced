package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/domain"
)

var ErrNotFound = errors.New("note not found")

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) List(ctx context.Context, userID string, limit, offset int) ([]domain.Note, error) {
	rows, err := p.db.Query(ctx, `
		SELECT topic_id, block_index, note_text, created_at, updated_at
		FROM block_notes
		WHERE user_id = $1
		ORDER BY updated_at DESC, topic_id, block_index
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Note, 0)
	for rows.Next() {
		var item domain.Note
		if err := rows.Scan(
			&item.TopicID,
			&item.BlockIndex,
			&item.Text,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) Get(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) (domain.Note, error) {
	var item domain.Note
	err := p.db.QueryRow(ctx, `
		SELECT topic_id, block_index, note_text, created_at, updated_at
		FROM block_notes
		WHERE user_id = $1 AND topic_id = $2 AND block_index = $3
	`, userID, topicID, blockIndex).Scan(
		&item.TopicID,
		&item.BlockIndex,
		&item.Text,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Note{}, ErrNotFound
	}
	return item, err
}

func (p *Postgres) Upsert(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
	text string,
	now time.Time,
) (domain.Note, error) {
	var item domain.Note
	err := p.db.QueryRow(ctx, `
		INSERT INTO block_notes (
			user_id, topic_id, block_index, note_text, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $5)
		ON CONFLICT (user_id, topic_id, block_index) DO UPDATE
		SET note_text = EXCLUDED.note_text,
		    updated_at = EXCLUDED.updated_at
		WHERE block_notes.note_text IS DISTINCT FROM EXCLUDED.note_text
		RETURNING topic_id, block_index, note_text, created_at, updated_at
	`, userID, topicID, blockIndex, text, now).Scan(
		&item.TopicID,
		&item.BlockIndex,
		&item.Text,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		existing, getErr := p.Get(ctx, userID, topicID, blockIndex)
		if getErr != nil {
			return domain.Note{}, getErr
		}
		return existing, nil
	}
	if err != nil {
		return domain.Note{}, err
	}
	return item, nil
}

func (p *Postgres) Delete(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) (bool, error) {
	tag, err := p.db.Exec(ctx, `
		DELETE FROM block_notes
		WHERE user_id = $1 AND topic_id = $2 AND block_index = $3
	`, userID, topicID, blockIndex)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}
