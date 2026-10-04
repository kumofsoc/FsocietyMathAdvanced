package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) CreateAccount(ctx context.Context, params CreateAccountParams) (domain.User, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.User{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, password_hash)
		VALUES ($1, $2, $3)
	`, params.ID, params.Email, params.PasswordHash)
	if err != nil {
		return domain.User{}, mapWriteError(err)
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO profiles (user_id, handle, display_name, bio)
		VALUES ($1, $2, $3, $4)
	`, params.ID, params.Handle, params.DisplayName, params.Bio)
	if err != nil {
		return domain.User{}, mapWriteError(err)
	}

	user, err := byID(ctx, tx, params.ID)
	if err != nil {
		return domain.User{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.User{}, err
	}
	return user, nil
}

func (p *Postgres) ByEmail(ctx context.Context, email string) (domain.User, error) {
	return scanUser(p.db.QueryRow(ctx, userSelect+` WHERE u.email = $1`, email))
}

func (p *Postgres) ByID(ctx context.Context, id string) (domain.User, error) {
	return byID(ctx, p.db, id)
}

func (p *Postgres) UpdateProfile(ctx context.Context, userID string, params UpdateProfileParams) (domain.User, error) {
	tag, err := p.db.Exec(ctx, `
		UPDATE profiles
		SET handle = $2, display_name = $3, bio = $4, updated_at = now()
		WHERE user_id = $1
	`, userID, params.Handle, params.DisplayName, params.Bio)
	if err != nil {
		return domain.User{}, mapWriteError(err)
	}
	if tag.RowsAffected() == 0 {
		return domain.User{}, ErrNotFound
	}
	return p.ByID(ctx, userID)
}

const userSelect = `
	SELECT
		u.id, u.email, u.password_hash, u.status, u.created_at, u.updated_at,
		p.user_id, p.handle, p.display_name, p.bio, p.avatar_url, p.created_at, p.updated_at
	FROM users u
	JOIN profiles p ON p.user_id = u.id
`

type rowScanner interface {
	Scan(...any) error
}

type queryRower interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}

func byID(ctx context.Context, db queryRower, id string) (domain.User, error) {
	return scanUser(db.QueryRow(ctx, userSelect+` WHERE u.id = $1`, id))
}

func scanUser(row rowScanner) (domain.User, error) {
	var user domain.User
	var avatar sql.NullString
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Profile.UserID,
		&user.Profile.Handle,
		&user.Profile.DisplayName,
		&user.Profile.Bio,
		&avatar,
		&user.Profile.CreatedAt,
		&user.Profile.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}
	if avatar.Valid {
		user.Profile.AvatarURL = &avatar.String
	}
	return user, nil
}

func mapWriteError(err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
		return err
	}
	switch pgErr.ConstraintName {
	case "users_email_key":
		return ErrEmailTaken
	case "profiles_handle_key":
		return ErrHandleTaken
	default:
		return err
	}
}
