package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/domain"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) Snapshot(ctx context.Context, userID string) (domain.Snapshot, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{
		IsoLevel:   pgx.RepeatableRead,
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return domain.Snapshot{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	out := domain.Snapshot{
		SavedTopicIDs: make([]string, 0),
		TopicResume:   make(map[string]domain.ResumeEntry),
		ReadingWidth:  "normal",
	}

	rows, err := tx.Query(ctx, `
		SELECT topic_id
		FROM saved_topics
		WHERE user_id = $1
		ORDER BY saved_at ASC, topic_id
	`, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	for rows.Next() {
		var topicID string
		if err := rows.Scan(&topicID); err != nil {
			rows.Close()
			return domain.Snapshot{}, err
		}
		out.SavedTopicIDs = append(out.SavedTopicIDs, topicID)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return domain.Snapshot{}, err
	}
	rows.Close()

	rows, err = tx.Query(ctx, `
		SELECT topic_id, block_index, updated_at
		FROM topic_resume_positions
		WHERE user_id = $1
		ORDER BY topic_id
	`, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	for rows.Next() {
		var topicID string
		var entry domain.ResumeEntry
		if err := rows.Scan(&topicID, &entry.BlockIndex, &entry.UpdatedAt); err != nil {
			rows.Close()
			return domain.Snapshot{}, err
		}
		out.TopicResume[topicID] = entry
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return domain.Snapshot{}, err
	}
	rows.Close()

	err = tx.QueryRow(ctx, `
		SELECT reading_width
		FROM user_workspace_settings
		WHERE user_id = $1
	`, userID).Scan(&out.ReadingWidth)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return domain.Snapshot{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Snapshot{}, err
	}
	return out.Normalize(), nil
}

func (p *Postgres) SetTopicSaved(
	ctx context.Context,
	userID string,
	topicID string,
	saved bool,
	now time.Time,
) (bool, error) {
	if saved {
		tag, err := p.db.Exec(ctx, `
			INSERT INTO saved_topics (user_id, topic_id, saved_at)
			VALUES ($1, $2, $3)
			ON CONFLICT (user_id, topic_id) DO NOTHING
		`, userID, topicID, now)
		if err != nil {
			return false, err
		}
		return tag.RowsAffected() > 0, nil
	}

	tag, err := p.db.Exec(ctx, `
		DELETE FROM saved_topics
		WHERE user_id = $1 AND topic_id = $2
	`, userID, topicID)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

func (p *Postgres) SetResume(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
	now time.Time,
) (bool, error) {
	tag, err := p.db.Exec(ctx, `
		INSERT INTO topic_resume_positions (user_id, topic_id, block_index, updated_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, topic_id) DO UPDATE
		SET block_index = EXCLUDED.block_index,
		    updated_at = EXCLUDED.updated_at
		WHERE topic_resume_positions.block_index IS DISTINCT FROM EXCLUDED.block_index
	`, userID, topicID, blockIndex, now)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

func (p *Postgres) SetReadingWidth(
	ctx context.Context,
	userID string,
	readingWidth string,
	now time.Time,
) (bool, error) {
	tag, err := p.db.Exec(ctx, `
		INSERT INTO user_workspace_settings (user_id, reading_width, created_at, updated_at)
		VALUES ($1, $2, $3, $3)
		ON CONFLICT (user_id) DO UPDATE
		SET reading_width = EXCLUDED.reading_width,
		    updated_at = EXCLUDED.updated_at
		WHERE user_workspace_settings.reading_width IS DISTINCT FROM EXCLUDED.reading_width
	`, userID, readingWidth, now)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}
