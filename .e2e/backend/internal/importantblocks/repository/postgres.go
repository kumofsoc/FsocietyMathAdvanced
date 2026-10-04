package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/domain"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) List(ctx context.Context, userID string) ([]domain.ImportantBlock, error) {
	rows, err := p.db.Query(ctx, `
		SELECT topic_id, block_index, created_at, updated_at
		FROM important_blocks
		WHERE user_id = $1
		ORDER BY updated_at ASC, topic_id, block_index
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.ImportantBlock, 0)
	for rows.Next() {
		var item domain.ImportantBlock
		if err := rows.Scan(&item.TopicID, &item.BlockIndex, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) Upsert(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
	now time.Time,
) (domain.ImportantBlock, error) {
	var item domain.ImportantBlock
	err := p.db.QueryRow(ctx, `
		INSERT INTO important_blocks (user_id, topic_id, block_index, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $4)
		ON CONFLICT (user_id, topic_id, block_index) DO NOTHING
		RETURNING topic_id, block_index, created_at, updated_at
	`, userID, topicID, blockIndex, now).Scan(
		&item.TopicID,
		&item.BlockIndex,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		err = p.db.QueryRow(ctx, `
			SELECT topic_id, block_index, created_at, updated_at
			FROM important_blocks
			WHERE user_id = $1 AND topic_id = $2 AND block_index = $3
		`, userID, topicID, blockIndex).Scan(
			&item.TopicID,
			&item.BlockIndex,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
	}
	return item, err
}

func (p *Postgres) Delete(ctx context.Context, userID, topicID string, blockIndex int) (bool, error) {
	tag, err := p.db.Exec(ctx, `
		DELETE FROM important_blocks
		WHERE user_id = $1 AND topic_id = $2 AND block_index = $3
	`, userID, topicID, blockIndex)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}
