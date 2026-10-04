package repository

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/domain"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) Get(ctx context.Context, userID string) (domain.Preferences, error) {
	item, err := scanPreferences(p.db.QueryRow(ctx, `
		SELECT user_id::text, theme_name, custom_theme, cursor_mode, motion_profile,
		       sidebar_collapsed, created_at, updated_at
		FROM user_preferences
		WHERE user_id = $1
	`, userID))
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Default(userID), nil
	}
	return item, err
}

func (p *Postgres) Replace(
	ctx context.Context,
	userID string,
	input domain.Input,
	now time.Time,
) (domain.Preferences, error) {
	normalized, err := domain.Normalize(input)
	if err != nil {
		return domain.Preferences{}, err
	}

	customTheme, err := json.Marshal(normalized.CustomTheme)
	if err != nil {
		return domain.Preferences{}, err
	}

	return scanPreferences(p.db.QueryRow(ctx, `
		INSERT INTO user_preferences (
			user_id, theme_name, custom_theme, cursor_mode, motion_profile,
			sidebar_collapsed, created_at, updated_at
		)
		VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $7)
		ON CONFLICT (user_id) DO UPDATE
		SET theme_name = EXCLUDED.theme_name,
		    custom_theme = EXCLUDED.custom_theme,
		    cursor_mode = EXCLUDED.cursor_mode,
		    motion_profile = EXCLUDED.motion_profile,
		    sidebar_collapsed = EXCLUDED.sidebar_collapsed,
		    updated_at = CASE
		        WHEN user_preferences.theme_name IS DISTINCT FROM EXCLUDED.theme_name
		          OR user_preferences.custom_theme IS DISTINCT FROM EXCLUDED.custom_theme
		          OR user_preferences.cursor_mode IS DISTINCT FROM EXCLUDED.cursor_mode
		          OR user_preferences.motion_profile IS DISTINCT FROM EXCLUDED.motion_profile
		          OR user_preferences.sidebar_collapsed IS DISTINCT FROM EXCLUDED.sidebar_collapsed
		        THEN EXCLUDED.updated_at
		        ELSE user_preferences.updated_at
		    END
		RETURNING user_id::text, theme_name, custom_theme, cursor_mode, motion_profile,
		          sidebar_collapsed, created_at, updated_at
	`, userID, normalized.ThemeName, string(customTheme), normalized.CursorMode,
		normalized.MotionProfile, normalized.SidebarCollapsed, now))
}

type scanner interface {
	Scan(...any) error
}

func scanPreferences(row scanner) (domain.Preferences, error) {
	var item domain.Preferences
	var customTheme []byte
	if err := row.Scan(
		&item.UserID,
		&item.ThemeName,
		&customTheme,
		&item.CursorMode,
		&item.MotionProfile,
		&item.SidebarCollapsed,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return domain.Preferences{}, err
	}
	if err := json.Unmarshal(customTheme, &item.CustomTheme); err != nil {
		return domain.Preferences{}, err
	}
	return item, nil
}
