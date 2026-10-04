package migrations

import (
	"context"
	"fmt"
	"io/fs"
	"path"
	"sort"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type migration struct {
	version  int64
	name     string
	upPath   string
	downPath string
}

func Up(ctx context.Context, db *pgxpool.Pool, filesystem fs.FS, dir string) error {
	items, err := discover(filesystem, dir)
	if err != nil {
		return err
	}
	if err := ensureTrackingTable(ctx, db); err != nil {
		return err
	}
	if err := bootstrapLegacy(ctx, db, items); err != nil {
		return err
	}

	applied, err := appliedVersions(ctx, db)
	if err != nil {
		return err
	}
	for _, item := range items {
		if _, ok := applied[item.version]; ok {
			continue
		}
		if err := applyOne(ctx, db, filesystem, item); err != nil {
			return err
		}
	}
	return nil
}

func DownAll(ctx context.Context, db *pgxpool.Pool, filesystem fs.FS, dir string) error {
	items, err := discover(filesystem, dir)
	if err != nil {
		return err
	}
	if err := ensureTrackingTable(ctx, db); err != nil {
		return err
	}
	if err := bootstrapLegacy(ctx, db, items); err != nil {
		return err
	}

	applied, err := appliedVersions(ctx, db)
	if err != nil {
		return err
	}

	for i := len(items) - 1; i >= 0; i-- {
		item := items[i]
		if _, ok := applied[item.version]; !ok {
			continue
		}
		if item.downPath == "" {
			return fmt.Errorf("migration %04d has no down file", item.version)
		}
		raw, err := fs.ReadFile(filesystem, item.downPath)
		if err != nil {
			return fmt.Errorf("read migration %04d down: %w", item.version, err)
		}

		tx, err := db.BeginTx(ctx, pgx.TxOptions{})
		if err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, string(raw), pgx.QueryExecModeSimpleProtocol); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("apply migration %04d down: %w", item.version, err)
		}
		if _, err := tx.Exec(ctx, "DELETE FROM schema_migrations WHERE version = $1", item.version); err != nil {
			_ = tx.Rollback(ctx)
			return err
		}
		if err := tx.Commit(ctx); err != nil {
			return err
		}
	}
	return nil
}

func discover(filesystem fs.FS, dir string) ([]migration, error) {
	entries, err := fs.ReadDir(filesystem, dir)
	if err != nil {
		return nil, fmt.Errorf("read migrations directory: %w", err)
	}

	byVersion := map[int64]migration{}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		var direction string
		switch {
		case strings.HasSuffix(name, ".up.sql"):
			direction = "up"
		case strings.HasSuffix(name, ".down.sql"):
			direction = "down"
		default:
			continue
		}

		prefix, _, ok := strings.Cut(name, "_")
		if !ok {
			return nil, fmt.Errorf("invalid migration filename %q", name)
		}
		version, err := strconv.ParseInt(prefix, 10, 64)
		if err != nil || version <= 0 {
			return nil, fmt.Errorf("invalid migration version in %q", name)
		}

		item := byVersion[version]
		item.version = version
		item.name = name
		if direction == "up" {
			item.upPath = path.Join(dir, name)
			item.name = strings.TrimSuffix(name, ".up.sql")
		} else {
			item.downPath = path.Join(dir, name)
		}
		byVersion[version] = item
	}

	items := make([]migration, 0, len(byVersion))
	for _, item := range byVersion {
		if item.upPath == "" {
			return nil, fmt.Errorf("migration %04d has no up file", item.version)
		}
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool { return items[i].version < items[j].version })
	return items, nil
}

func ensureTrackingTable(ctx context.Context, db *pgxpool.Pool) error {
	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version bigint PRIMARY KEY,
			name text NOT NULL,
			applied_at timestamptz NOT NULL DEFAULT now()
		)
	`)
	return err
}

func appliedVersions(ctx context.Context, db *pgxpool.Pool) (map[int64]struct{}, error) {
	rows, err := db.Query(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := map[int64]struct{}{}
	for rows.Next() {
		var version int64
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		out[version] = struct{}{}
	}
	return out, rows.Err()
}

func applyOne(ctx context.Context, db *pgxpool.Pool, filesystem fs.FS, item migration) error {
	raw, err := fs.ReadFile(filesystem, item.upPath)
	if err != nil {
		return fmt.Errorf("read migration %04d up: %w", item.version, err)
	}

	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, string(raw), pgx.QueryExecModeSimpleProtocol); err != nil {
		return fmt.Errorf("apply migration %04d up: %w", item.version, err)
	}
	if _, err := tx.Exec(ctx,
		"INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
		item.version,
		item.name,
	); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func bootstrapLegacy(ctx context.Context, db *pgxpool.Pool, items []migration) error {
	applied, err := appliedVersions(ctx, db)
	if err != nil {
		return err
	}

	for _, item := range items {
		if _, ok := applied[item.version]; ok {
			continue
		}
		present, known, err := legacyMigrationPresent(ctx, db, item.version)
		if err != nil {
			return err
		}
		if !known || !present {
			continue
		}
		if _, err := db.Exec(ctx,
			"INSERT INTO schema_migrations (version, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
			item.version,
			item.name,
		); err != nil {
			return err
		}
	}
	return nil
}

func legacyMigrationPresent(ctx context.Context, db *pgxpool.Pool, version int64) (bool, bool, error) {
	switch version {
	case 1:
		return allTablesExist(ctx, db, "users", "profiles", "sessions", "refresh_tokens")
	case 2:
		return allTablesExist(ctx, db, "learning_state", "topic_progress", "exercise_progress", "saved_theorems")
	case 3:
		return allTablesExist(ctx, db, "activity_events")
	case 4:
		ok, err := allColumnsExist(ctx, db, "saved_theorems", "id", "kind", "title", "updated_at")
		return ok, true, err
	case 5:
		ok, err := allColumnsExist(ctx, db, "topic_progress", "opened_at", "last_interaction_at")
		return ok, true, err
	case 6:
		return allTablesExist(ctx, db, "media_audio_tracks")
	default:
		return false, false, nil
	}
}

func allTablesExist(ctx context.Context, db *pgxpool.Pool, names ...string) (bool, bool, error) {
	for _, name := range names {
		var exists bool
		if err := db.QueryRow(ctx, "SELECT to_regclass('public.' || $1) IS NOT NULL", name).Scan(&exists); err != nil {
			return false, true, err
		}
		if !exists {
			return false, true, nil
		}
	}
	return true, true, nil
}

func allColumnsExist(ctx context.Context, db *pgxpool.Pool, table string, columns ...string) (bool, error) {
	var count int
	if err := db.QueryRow(ctx, `
		SELECT count(*)
		FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = $1
		  AND column_name = ANY($2::text[])
	`, table, columns).Scan(&count); err != nil {
		return false, err
	}
	return count == len(columns), nil
}
