package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
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

	snapshot, err := readSnapshot(ctx, tx, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot, nil
}

func (p *Postgres) Topic(ctx context.Context, userID, topicID string) (domain.TopicState, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.TopicState{}, err
	}

	var state domain.TopicState
	var openedAt sql.NullTime
	var theoryCompletedAt sql.NullTime
	err = p.db.QueryRow(ctx, `
		SELECT topic_id, opened_at, reading_ratio, theory_completed_at, last_interaction_at, updated_at
		FROM topic_progress
		WHERE user_id = $1 AND topic_id = $2
	`, userID, normalizedTopicID).Scan(
		&state.TopicID,
		&openedAt,
		&state.ReadingRatio,
		&theoryCompletedAt,
		&state.LastInteractionAt,
		&state.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.TopicState{TopicID: normalizedTopicID}, nil
	}
	if err != nil {
		return domain.TopicState{}, err
	}
	if openedAt.Valid {
		state.OpenedAt = &openedAt.Time
	}
	if theoryCompletedAt.Valid {
		state.TheoryCompletedAt = &theoryCompletedAt.Time
	}
	return state, nil
}

func (p *Postgres) Sync(
	ctx context.Context,
	userID string,
	input domain.SyncInput,
	now time.Time,
) (domain.Snapshot, error) {
	normalized, err := domain.NormalizeSync(input)
	if err != nil {
		return domain.Snapshot{}, err
	}

	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.Snapshot{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := ensureState(ctx, tx, userID); err != nil {
		return domain.Snapshot{}, err
	}
	if err := lockState(ctx, tx, userID); err != nil {
		return domain.Snapshot{}, err
	}

	changed := false

	var affected int64
	if err := tx.QueryRow(ctx, `
		WITH changed AS (
			INSERT INTO topic_progress
				(user_id, topic_id, reading_ratio, theory_completed_at, opened_at, last_interaction_at, created_at, updated_at)
			SELECT $1, topic_id, 0, $3, $3, $3, $3, $3
			FROM unnest($2::text[]) AS input(topic_id)
			ON CONFLICT (user_id, topic_id) DO UPDATE
			SET theory_completed_at = EXCLUDED.theory_completed_at,
			    opened_at = COALESCE(topic_progress.opened_at, EXCLUDED.opened_at),
			    last_interaction_at = EXCLUDED.last_interaction_at,
			    updated_at = EXCLUDED.updated_at
			WHERE topic_progress.theory_completed_at IS NULL
			RETURNING 1
		)
		SELECT count(*) FROM changed
	`, userID, normalized.TheoryRead, now).Scan(&affected); err != nil {
		return domain.Snapshot{}, err
	}
	changed = changed || affected > 0

	readingIDs := make([]string, 0, len(normalized.Reading))
	readingRatios := make([]float64, 0, len(normalized.Reading))
	for topicID, ratio := range normalized.Reading {
		if ratio == 0 {
			continue
		}
		readingIDs = append(readingIDs, topicID)
		readingRatios = append(readingRatios, ratio)
	}

	affected = 0
	if err := tx.QueryRow(ctx, `
		WITH changed AS (
			INSERT INTO topic_progress
				(user_id, topic_id, reading_ratio, opened_at, last_interaction_at, created_at, updated_at)
			SELECT $1, input.topic_id, input.ratio, $4, $4, $4, $4
			FROM unnest($2::text[], $3::float8[]) AS input(topic_id, ratio)
			ON CONFLICT (user_id, topic_id) DO UPDATE
			SET reading_ratio = EXCLUDED.reading_ratio,
			    opened_at = COALESCE(topic_progress.opened_at, EXCLUDED.opened_at),
			    last_interaction_at = EXCLUDED.last_interaction_at,
			    updated_at = EXCLUDED.updated_at
			WHERE EXCLUDED.reading_ratio > topic_progress.reading_ratio
			RETURNING 1
		)
		SELECT count(*) FROM changed
	`, userID, readingIDs, readingRatios, now).Scan(&affected); err != nil {
		return domain.Snapshot{}, err
	}
	changed = changed || affected > 0

	affected = 0
	if err := tx.QueryRow(ctx, `
		WITH changed AS (
			INSERT INTO exercise_progress (user_id, task_id, solved_at)
			SELECT $1, task_id, $3
			FROM unnest($2::text[]) AS input(task_id)
			ON CONFLICT (user_id, task_id) DO NOTHING
			RETURNING 1
		)
		SELECT count(*) FROM changed
	`, userID, normalized.SolvedTaskIDs, now).Scan(&affected); err != nil {
		return domain.Snapshot{}, err
	}
	changed = changed || affected > 0

	affected = 0
	if err := tx.QueryRow(ctx, `
		WITH changed AS (
			INSERT INTO saved_theorems (user_id, theorem_id, saved_at)
			SELECT $1, theorem_id, $3
			FROM unnest($2::text[]) AS input(theorem_id)
			ON CONFLICT (user_id, theorem_id) DO NOTHING
			RETURNING 1
		)
		SELECT count(*) FROM changed
	`, userID, normalized.SavedTheoremIDs, now).Scan(&affected); err != nil {
		return domain.Snapshot{}, err
	}
	changed = changed || affected > 0

	if normalized.LastTopicID != nil {
		tag, err := tx.Exec(ctx, `
			UPDATE learning_state
			SET last_topic_id = $2
			WHERE user_id = $1
			  AND last_topic_id IS DISTINCT FROM $2
		`, userID, *normalized.LastTopicID)
		if err != nil {
			return domain.Snapshot{}, err
		}
		changed = changed || tag.RowsAffected() > 0
	}

	if normalized.ClientUpdatedAt != nil {
		if _, err := tx.Exec(ctx, `
			UPDATE learning_state
			SET client_updated_at = CASE
				WHEN client_updated_at IS NULL OR $2 > client_updated_at THEN $2
				ELSE client_updated_at
			END
			WHERE user_id = $1
		`, userID, *normalized.ClientUpdatedAt); err != nil {
			return domain.Snapshot{}, err
		}
	}

	if changed {
		if _, err := tx.Exec(ctx, `
			UPDATE learning_state
			SET revision = revision + 1,
			    updated_at = $2
			WHERE user_id = $1
		`, userID, now); err != nil {
			return domain.Snapshot{}, err
		}
	}

	snapshot, err := readSnapshot(ctx, tx, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot, nil
}

func (p *Postgres) PatchTopic(
	ctx context.Context,
	userID string,
	topicID string,
	patch domain.TopicPatch,
	now time.Time,
) (domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if err := patch.Validate(); err != nil {
		return domain.Snapshot{}, err
	}

	return p.mutate(ctx, userID, now, func(tx pgx.Tx) (bool, error) {
		changed := false

		if patch.Opened != nil {
			tag, err := tx.Exec(ctx, `
				INSERT INTO topic_progress
					(user_id, topic_id, reading_ratio, opened_at, last_interaction_at, created_at, updated_at)
				VALUES ($1, $2, 0, $3, $3, $3, $3)
				ON CONFLICT (user_id, topic_id) DO UPDATE
				SET opened_at = EXCLUDED.opened_at,
				    last_interaction_at = EXCLUDED.last_interaction_at,
				    updated_at = EXCLUDED.updated_at
				WHERE topic_progress.opened_at IS NULL
			`, userID, normalizedTopicID, now)
			if err != nil {
				return false, err
			}
			if tag.RowsAffected() > 0 {
				if err := insertActivityEvent(ctx, tx, userID, "topic_opened", normalizedTopicID, &normalizedTopicID, now); err != nil {
					return false, err
				}
				changed = true
			}
		}

		if patch.ReadingRatio != nil && *patch.ReadingRatio > 0 {
			tag, err := tx.Exec(ctx, `
				INSERT INTO topic_progress
					(user_id, topic_id, reading_ratio, opened_at, last_interaction_at, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $4, $4, $4)
				ON CONFLICT (user_id, topic_id) DO UPDATE
				SET reading_ratio = EXCLUDED.reading_ratio,
				    opened_at = COALESCE(topic_progress.opened_at, EXCLUDED.opened_at),
				    last_interaction_at = EXCLUDED.last_interaction_at,
				    updated_at = EXCLUDED.updated_at
				WHERE EXCLUDED.reading_ratio > topic_progress.reading_ratio
			`, userID, normalizedTopicID, *patch.ReadingRatio, now)
			if err != nil {
				return false, err
			}
			changed = changed || tag.RowsAffected() > 0
		}

		if patch.TheoryComplete != nil {
			tag, err := tx.Exec(ctx, `
				INSERT INTO topic_progress
					(user_id, topic_id, reading_ratio, theory_completed_at, opened_at, last_interaction_at, created_at, updated_at)
				VALUES ($1, $2, 0, $3, $3, $3, $3, $3)
				ON CONFLICT (user_id, topic_id) DO UPDATE
				SET theory_completed_at = EXCLUDED.theory_completed_at,
				    opened_at = COALESCE(topic_progress.opened_at, EXCLUDED.opened_at),
				    last_interaction_at = EXCLUDED.last_interaction_at,
				    updated_at = EXCLUDED.updated_at
				WHERE topic_progress.theory_completed_at IS NULL
			`, userID, normalizedTopicID, now)
			if err != nil {
				return false, err
			}
			if tag.RowsAffected() > 0 {
				if err := insertActivityEvent(ctx, tx, userID, "theory_completed", normalizedTopicID, &normalizedTopicID, now); err != nil {
					return false, err
				}
				changed = true
			}
		}

		return changed, nil
	})
}

func (p *Postgres) SetTheoryCompletion(
	ctx context.Context,
	userID string,
	topicID string,
	completed bool,
	now time.Time,
) (domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}

	if completed {
		value := true
		return p.PatchTopic(ctx, userID, normalizedTopicID, domain.TopicPatch{TheoryComplete: &value}, now)
	}

	return p.mutate(ctx, userID, now, func(tx pgx.Tx) (bool, error) {
		tag, err := tx.Exec(ctx, `
			UPDATE topic_progress
			SET theory_completed_at = NULL,
			    last_interaction_at = $3,
			    updated_at = $3
			WHERE user_id = $1
			  AND topic_id = $2
			  AND theory_completed_at IS NOT NULL
		`, userID, normalizedTopicID, now)
		if err != nil {
			return false, err
		}
		return tag.RowsAffected() > 0, nil
	})
}

func (p *Postgres) SetExercise(
	ctx context.Context,
	userID string,
	taskID string,
	topicID string,
	solved bool,
	now time.Time,
) (domain.Snapshot, error) {
	normalizedTaskID, err := domain.NormalizeID(taskID, domain.MaxTaskIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}

	var normalizedTopicID *string
	if topicID != "" {
		value, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
		if err != nil {
			return domain.Snapshot{}, err
		}
		normalizedTopicID = &value
	}

	return p.mutate(ctx, userID, now, func(tx pgx.Tx) (bool, error) {
		if solved {
			tag, err := tx.Exec(ctx, `
				INSERT INTO exercise_progress (user_id, task_id, topic_id, solved_at)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (user_id, task_id) DO NOTHING
			`, userID, normalizedTaskID, normalizedTopicID, now)
			if err != nil {
				return false, err
			}
			if tag.RowsAffected() == 0 {
				return false, nil
			}
			if normalizedTopicID != nil {
				if _, err := tx.Exec(ctx, `
					INSERT INTO topic_progress
						(user_id, topic_id, reading_ratio, opened_at, last_interaction_at, created_at, updated_at)
					VALUES ($1, $2, 0, $3, $3, $3, $3)
					ON CONFLICT (user_id, topic_id) DO UPDATE
					SET last_interaction_at = EXCLUDED.last_interaction_at,
					    updated_at = EXCLUDED.updated_at
				`, userID, *normalizedTopicID, now); err != nil {
					return false, err
				}
			}
			if err := insertActivityEvent(ctx, tx, userID, "exercise_solved", normalizedTaskID, normalizedTopicID, now); err != nil {
				return false, err
			}
			return true, nil
		}

		tag, err := tx.Exec(ctx, `
			DELETE FROM exercise_progress
			WHERE user_id = $1 AND task_id = $2
		`, userID, normalizedTaskID)
		if err != nil {
			return false, err
		}
		return tag.RowsAffected() > 0, nil
	})
}

func (p *Postgres) SetTheorem(
	ctx context.Context,
	userID string,
	theoremID string,
	topicID string,
	saved bool,
	now time.Time,
) (domain.Snapshot, error) {
	normalizedTheoremID, err := domain.NormalizeID(theoremID, domain.MaxTheoremIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}

	var normalizedTopicID *string
	if topicID != "" {
		value, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
		if err != nil {
			return domain.Snapshot{}, err
		}
		normalizedTopicID = &value
	}

	return p.mutate(ctx, userID, now, func(tx pgx.Tx) (bool, error) {
		if saved {
			tag, err := tx.Exec(ctx, `
				INSERT INTO saved_theorems (user_id, theorem_id, topic_id, saved_at)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (user_id, theorem_id) DO NOTHING
			`, userID, normalizedTheoremID, normalizedTopicID, now)
			if err != nil {
				return false, err
			}
			if tag.RowsAffected() == 0 {
				return false, nil
			}
			if err := insertActivityEvent(ctx, tx, userID, "bookmark_added", normalizedTheoremID, normalizedTopicID, now); err != nil {
				return false, err
			}
			return true, nil
		}

		tag, err := tx.Exec(ctx, `
			DELETE FROM saved_theorems
			WHERE user_id = $1 AND theorem_id = $2
		`, userID, normalizedTheoremID)
		if err != nil {
			return false, err
		}
		return tag.RowsAffected() > 0, nil
	})
}

func (p *Postgres) SetResume(
	ctx context.Context,
	userID string,
	topicID string,
	now time.Time,
) (domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}

	return p.mutate(ctx, userID, now, func(tx pgx.Tx) (bool, error) {
		changed := false
		tag, err := tx.Exec(ctx, `
			UPDATE learning_state
			SET last_topic_id = $2
			WHERE user_id = $1
			  AND last_topic_id IS DISTINCT FROM $2
		`, userID, normalizedTopicID)
		if err != nil {
			return false, err
		}
		changed = tag.RowsAffected() > 0

		inserted, err := tx.Exec(ctx, `
			INSERT INTO topic_progress
				(user_id, topic_id, reading_ratio, opened_at, last_interaction_at, created_at, updated_at)
			VALUES ($1, $2, 0, $3, $3, $3, $3)
			ON CONFLICT (user_id, topic_id) DO NOTHING
		`, userID, normalizedTopicID, now)
		if err != nil {
			return false, err
		}
		if inserted.RowsAffected() > 0 {
			if err := insertActivityEvent(ctx, tx, userID, "topic_opened", normalizedTopicID, &normalizedTopicID, now); err != nil {
				return false, err
			}
			changed = true
		} else {
			opened, err := tx.Exec(ctx, `
				UPDATE topic_progress
				SET opened_at = $3,
				    last_interaction_at = $3,
				    updated_at = $3
				WHERE user_id = $1 AND topic_id = $2 AND opened_at IS NULL
			`, userID, normalizedTopicID, now)
			if err != nil {
				return false, err
			}
			if opened.RowsAffected() > 0 {
				if err := insertActivityEvent(ctx, tx, userID, "topic_opened", normalizedTopicID, &normalizedTopicID, now); err != nil {
					return false, err
				}
				changed = true
			} else if changed {
				if _, err := tx.Exec(ctx, `
					UPDATE topic_progress
					SET last_interaction_at = $3, updated_at = $3
					WHERE user_id = $1 AND topic_id = $2
				`, userID, normalizedTopicID, now); err != nil {
					return false, err
				}
			}
		}
		return changed, nil
	})
}

func (p *Postgres) MergeReadingBlocks(
	ctx context.Context,
	userID string,
	blocks []domain.ReadingBlockRef,
	totalBlocks map[string]int,
	now time.Time,
) (domain.Snapshot, error) {
	normalized, err := domain.NormalizeReadingBlockRefs(blocks)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if len(normalized) == 0 {
		return p.Snapshot(ctx, userID)
	}

	topicIDs := make([]string, 0, len(normalized))
	blockIndices := make([]int32, 0, len(normalized))
	for _, block := range normalized {
		if totalBlocks[block.TopicID] <= 0 {
			return domain.Snapshot{}, domain.ErrInvalidPatch
		}
		topicIDs = append(topicIDs, block.TopicID)
		blockIndices = append(blockIndices, int32(block.BlockIndex))
	}

	return p.mutate(ctx, userID, now, func(tx pgx.Tx) (bool, error) {
		rows, err := tx.Query(ctx, `
			INSERT INTO reading_blocks (user_id, topic_id, block_index, read_at)
			SELECT $1, input.topic_id, input.block_index, $4
			FROM unnest($2::text[], $3::int4[]) AS input(topic_id, block_index)
			ON CONFLICT (user_id, topic_id, block_index) DO NOTHING
			RETURNING topic_id
		`, userID, topicIDs, blockIndices, now)
		if err != nil {
			return false, err
		}

		affectedTopics := make(map[string]struct{})
		for rows.Next() {
			var topicID string
			if err := rows.Scan(&topicID); err != nil {
				rows.Close()
				return false, err
			}
			affectedTopics[topicID] = struct{}{}
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return false, err
		}
		rows.Close()

		if len(affectedTopics) == 0 {
			return false, nil
		}

		for topicID := range affectedTopics {
			var seen int
			if err := tx.QueryRow(ctx, `
				SELECT count(*)
				FROM reading_blocks
				WHERE user_id = $1 AND topic_id = $2
			`, userID, topicID).Scan(&seen); err != nil {
				return false, err
			}

			total := totalBlocks[topicID]
			ratio := float64(seen) / float64(total)
			if ratio > 1 {
				ratio = 1
			}

			if _, err := tx.Exec(ctx, `
				INSERT INTO topic_progress
					(user_id, topic_id, reading_ratio, opened_at, last_interaction_at, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $4, $4, $4)
				ON CONFLICT (user_id, topic_id) DO UPDATE
				SET reading_ratio = GREATEST(topic_progress.reading_ratio, EXCLUDED.reading_ratio),
				    opened_at = COALESCE(topic_progress.opened_at, EXCLUDED.opened_at),
				    last_interaction_at = EXCLUDED.last_interaction_at,
				    updated_at = EXCLUDED.updated_at
			`, userID, topicID, ratio, now); err != nil {
				return false, err
			}
		}

		return true, nil
	})
}

func (p *Postgres) mutate(
	ctx context.Context,
	userID string,
	now time.Time,
	mutation func(pgx.Tx) (bool, error),
) (domain.Snapshot, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.Snapshot{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := ensureState(ctx, tx, userID); err != nil {
		return domain.Snapshot{}, err
	}
	if err := lockState(ctx, tx, userID); err != nil {
		return domain.Snapshot{}, err
	}

	changed, err := mutation(tx)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if changed {
		if _, err := tx.Exec(ctx, `
			UPDATE learning_state
			SET revision = revision + 1,
			    updated_at = $2
			WHERE user_id = $1
		`, userID, now); err != nil {
			return domain.Snapshot{}, err
		}
	}

	snapshot, err := readSnapshot(ctx, tx, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot, nil
}

func ensureState(ctx context.Context, tx pgx.Tx, userID string) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO learning_state (user_id)
		VALUES ($1)
		ON CONFLICT (user_id) DO NOTHING
	`, userID)
	return err
}

func lockState(ctx context.Context, tx pgx.Tx, userID string) error {
	var ignored string
	return tx.QueryRow(ctx, `
		SELECT user_id::text
		FROM learning_state
		WHERE user_id = $1
		FOR UPDATE
	`, userID).Scan(&ignored)
}

func readSnapshot(ctx context.Context, tx pgx.Tx, userID string) (domain.Snapshot, error) {
	var snapshot domain.Snapshot
	var lastTopic sql.NullString

	err := tx.QueryRow(ctx, `
		SELECT revision, last_topic_id, updated_at
		FROM learning_state
		WHERE user_id = $1
	`, userID).Scan(&snapshot.Revision, &lastTopic, &snapshot.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return (domain.Snapshot{}).Normalize(), nil
	}
	if err != nil {
		return domain.Snapshot{}, err
	}
	if lastTopic.Valid {
		snapshot.LastTopicID = &lastTopic.String
	}

	rows, err := tx.Query(ctx, `
		SELECT topic_id, reading_ratio, theory_completed_at
		FROM topic_progress
		WHERE user_id = $1
		ORDER BY topic_id
	`, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	for rows.Next() {
		var topicID string
		var ratio float64
		var theoryAt sql.NullTime
		if err := rows.Scan(&topicID, &ratio, &theoryAt); err != nil {
			rows.Close()
			return domain.Snapshot{}, err
		}
		if ratio > 0 {
			if snapshot.Reading == nil {
				snapshot.Reading = make(map[string]float64)
			}
			snapshot.Reading[topicID] = ratio
		}
		if theoryAt.Valid {
			snapshot.TheoryRead = append(snapshot.TheoryRead, topicID)
		}
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return domain.Snapshot{}, err
	}
	rows.Close()

	rows, err = tx.Query(ctx, `
		SELECT task_id
		FROM exercise_progress
		WHERE user_id = $1
		ORDER BY task_id
	`, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	for rows.Next() {
		var taskID string
		if err := rows.Scan(&taskID); err != nil {
			rows.Close()
			return domain.Snapshot{}, err
		}
		snapshot.SolvedTaskIDs = append(snapshot.SolvedTaskIDs, taskID)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return domain.Snapshot{}, err
	}
	rows.Close()

	rows, err = tx.Query(ctx, `
		SELECT theorem_id
		FROM saved_theorems
		WHERE user_id = $1
		ORDER BY theorem_id
	`, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	for rows.Next() {
		var theoremID string
		if err := rows.Scan(&theoremID); err != nil {
			rows.Close()
			return domain.Snapshot{}, err
		}
		snapshot.SavedTheoremIDs = append(snapshot.SavedTheoremIDs, theoremID)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return domain.Snapshot{}, err
	}
	rows.Close()

	rows, err = tx.Query(ctx, `
		SELECT topic_id, block_index
		FROM reading_blocks
		WHERE user_id = $1
		ORDER BY topic_id, block_index
	`, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	for rows.Next() {
		var topicID string
		var blockIndex int
		if err := rows.Scan(&topicID, &blockIndex); err != nil {
			rows.Close()
			return domain.Snapshot{}, err
		}
		snapshot.ReadingBlockIDs = append(snapshot.ReadingBlockIDs, domain.ReadingBlockID(topicID, blockIndex))
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return domain.Snapshot{}, err
	}
	rows.Close()

	return snapshot.Normalize(), nil
}

func insertActivityEvent(
	ctx context.Context,
	tx pgx.Tx,
	userID string,
	eventType string,
	entityID string,
	topicID *string,
	occurredAt time.Time,
) error {
	var topic any
	if topicID != nil {
		topic = *topicID
	}
	_, err := tx.Exec(ctx, `
		INSERT INTO activity_events (user_id, event_type, entity_id, topic_id, occurred_at)
		VALUES ($1, $2, $3, $4, $5)
	`, userID, eventType, entityID, topic, occurredAt)
	return err
}
