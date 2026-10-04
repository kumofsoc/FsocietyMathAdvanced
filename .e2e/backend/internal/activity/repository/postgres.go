package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/domain"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) List(
	ctx context.Context,
	userID string,
	from time.Time,
	to time.Time,
	limit int,
) ([]domain.Event, error) {
	rows, err := p.db.Query(ctx, `
		SELECT id, event_type, entity_id, topic_id, occurred_at
		FROM activity_events
		WHERE user_id = $1
		  AND occurred_at >= $2
		  AND occurred_at < $3
		ORDER BY occurred_at DESC, id DESC
		LIMIT $4
	`, userID, from, to, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := make([]domain.Event, 0)
	for rows.Next() {
		var event domain.Event
		var entityID sql.NullString
		var topicID sql.NullString
		if err := rows.Scan(&event.ID, &event.Type, &entityID, &topicID, &event.OccurredAt); err != nil {
			return nil, err
		}
		if entityID.Valid {
			event.EntityID = &entityID.String
		}
		if topicID.Valid {
			event.TopicID = &topicID.String
		}
		events = append(events, event)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return events, nil
}

func (p *Postgres) DailyCounts(
	ctx context.Context,
	userID string,
	from time.Time,
	to time.Time,
) ([]domain.DayCount, error) {
	rows, err := p.db.Query(ctx, `
		SELECT
			(occurred_at AT TIME ZONE 'UTC')::date AS activity_date,
			count(*)::int
		FROM activity_events
		WHERE user_id = $1
		  AND occurred_at >= $2
		  AND occurred_at < $3
		GROUP BY activity_date
		ORDER BY activity_date
	`, userID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make([]domain.DayCount, 0)
	for rows.Next() {
		var item domain.DayCount
		if err := rows.Scan(&item.Date, &item.Count); err != nil {
			return nil, err
		}
		item.Date = item.Date.UTC()
		counts = append(counts, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return counts, nil
}
