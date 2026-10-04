package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/security"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) List(ctx context.Context, userID string) ([]domain.Bookmark, error) {
	rows, err := p.db.Query(ctx, `
		SELECT id::text, user_id::text, topic_id, theorem_id, kind, title, saved_at, updated_at
		FROM saved_theorems
		WHERE user_id = $1
		ORDER BY saved_at DESC, id DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]domain.Bookmark, 0)
	for rows.Next() {
		item, err := scanBookmark(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (p *Postgres) CreateOrUpgrade(
	ctx context.Context,
	userID string,
	input domain.CreateInput,
	now time.Time,
) (domain.Bookmark, bool, error) {
	normalized, err := domain.NormalizeCreate(input)
	if err != nil {
		return domain.Bookmark{}, false, err
	}

	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.Bookmark{}, false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := ensureLearningState(ctx, tx, userID); err != nil {
		return domain.Bookmark{}, false, err
	}
	if err := lockLearningState(ctx, tx, userID); err != nil {
		return domain.Bookmark{}, false, err
	}

	existing, err := bookmarkByContentBlock(ctx, tx, userID, normalized.ContentBlockID)
	switch {
	case err == nil:
		row := tx.QueryRow(ctx, `
			UPDATE saved_theorems
			SET topic_id = $3,
			    kind = $4,
			    title = $5,
			    updated_at = CASE
			        WHEN topic_id IS DISTINCT FROM $3
			          OR kind IS DISTINCT FROM $4
			          OR title IS DISTINCT FROM $5
			        THEN $6
			        ELSE updated_at
			    END
			WHERE user_id = $1 AND theorem_id = $2
			RETURNING id::text, user_id::text, topic_id, theorem_id, kind, title, saved_at, updated_at
		`, userID, normalized.ContentBlockID, normalized.TopicID, normalized.Kind, normalized.Title, now)
		item, scanErr := scanBookmark(row)
		if scanErr != nil {
			return domain.Bookmark{}, false, scanErr
		}
		if err := tx.Commit(ctx); err != nil {
			return domain.Bookmark{}, false, err
		}
		return item, false, nil
	case !errors.Is(err, pgx.ErrNoRows):
		return domain.Bookmark{}, false, err
	}
	_ = existing

	id, err := security.NewID()
	if err != nil {
		return domain.Bookmark{}, false, err
	}
	row := tx.QueryRow(ctx, `
		INSERT INTO saved_theorems
			(id, user_id, theorem_id, topic_id, kind, title, saved_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
		RETURNING id::text, user_id::text, topic_id, theorem_id, kind, title, saved_at, updated_at
	`, id, userID, normalized.ContentBlockID, normalized.TopicID, normalized.Kind, normalized.Title, now)
	item, err := scanBookmark(row)
	if err != nil {
		return domain.Bookmark{}, false, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO activity_events (user_id, event_type, entity_id, topic_id, occurred_at)
		VALUES ($1, 'bookmark_added', $2, $3, $4)
	`, userID, normalized.ContentBlockID, normalized.TopicID, now); err != nil {
		return domain.Bookmark{}, false, err
	}
	if err := bumpLearningRevision(ctx, tx, userID, now); err != nil {
		return domain.Bookmark{}, false, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Bookmark{}, false, err
	}
	return item, true, nil
}

func bookmarkByContentBlock(
	ctx context.Context,
	tx pgx.Tx,
	userID string,
	contentBlockID string,
) (domain.Bookmark, error) {
	return scanBookmark(tx.QueryRow(ctx, `
		SELECT id::text, user_id::text, topic_id, theorem_id, kind, title, saved_at, updated_at
		FROM saved_theorems
		WHERE user_id = $1 AND theorem_id = $2
	`, userID, contentBlockID))
}

func (p *Postgres) DeleteOwned(ctx context.Context, userID string, bookmarkID string, now time.Time) (bool, error) {
	normalizedID, err := domain.NormalizeBookmarkID(bookmarkID)
	if err != nil {
		return false, err
	}

	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := ensureLearningState(ctx, tx, userID); err != nil {
		return false, err
	}
	if err := lockLearningState(ctx, tx, userID); err != nil {
		return false, err
	}

	tag, err := tx.Exec(ctx, `
		DELETE FROM saved_theorems
		WHERE user_id = $1 AND id = $2::uuid
	`, userID, normalizedID)
	if err != nil {
		return false, err
	}
	deleted := tag.RowsAffected() > 0
	if deleted {
		if err := bumpLearningRevision(ctx, tx, userID, now); err != nil {
			return false, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return false, err
	}
	return deleted, nil
}

func ensureLearningState(ctx context.Context, tx pgx.Tx, userID string) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO learning_state (user_id)
		VALUES ($1)
		ON CONFLICT (user_id) DO NOTHING
	`, userID)
	return err
}

func lockLearningState(ctx context.Context, tx pgx.Tx, userID string) error {
	var ignored string
	return tx.QueryRow(ctx, `
		SELECT user_id::text
		FROM learning_state
		WHERE user_id = $1
		FOR UPDATE
	`, userID).Scan(&ignored)
}

func bumpLearningRevision(ctx context.Context, tx pgx.Tx, userID string, now time.Time) error {
	_, err := tx.Exec(ctx, `
		UPDATE learning_state
		SET revision = revision + 1,
		    updated_at = $2
		WHERE user_id = $1
	`, userID, now)
	return err
}

type scanner interface {
	Scan(...any) error
}

func scanBookmark(row scanner) (domain.Bookmark, error) {
	var item domain.Bookmark
	var topicID sql.NullString
	if err := row.Scan(
		&item.ID,
		&item.UserID,
		&topicID,
		&item.ContentBlockID,
		&item.Kind,
		&item.Title,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return domain.Bookmark{}, err
	}
	if topicID.Valid {
		value := topicID.String
		item.TopicID = &value
	}
	return item, nil
}
