package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/domain"
	usersdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	usersrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}

func (p *Postgres) RegisterAccount(
	ctx context.Context,
	account usersrepo.CreateAccountParams,
	session domain.Session,
	token domain.RefreshToken,
) (usersdomain.User, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return usersdomain.User{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var user usersdomain.User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (id, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, email, password_hash, status, created_at, updated_at
	`, account.ID, account.Email, account.PasswordHash).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return usersdomain.User{}, mapRegistrationWriteError(err)
	}

	var avatar sql.NullString
	err = tx.QueryRow(ctx, `
		INSERT INTO profiles (user_id, handle, display_name, bio)
		VALUES ($1, $2, $3, $4)
		RETURNING user_id, handle, display_name, bio, avatar_url, created_at, updated_at
	`, account.ID, account.Handle, account.DisplayName, account.Bio).Scan(
		&user.Profile.UserID,
		&user.Profile.Handle,
		&user.Profile.DisplayName,
		&user.Profile.Bio,
		&avatar,
		&user.Profile.CreatedAt,
		&user.Profile.UpdatedAt,
	)
	if err != nil {
		return usersdomain.User{}, mapRegistrationWriteError(err)
	}
	if avatar.Valid {
		user.Profile.AvatarURL = &avatar.String
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO sessions
			(id, user_id, user_agent, ip_address, created_at, last_seen_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, session.ID, session.UserID, session.UserAgent, session.IPAddress, session.CreatedAt, session.LastSeenAt, session.ExpiresAt); err != nil {
		return usersdomain.User{}, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO refresh_tokens
			(id, session_id, token_hash, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`, token.ID, token.SessionID, token.TokenHash[:], token.CreatedAt, token.ExpiresAt); err != nil {
		return usersdomain.User{}, err
	}

	if err := insertSessionStarted(ctx, tx, session); err != nil {
		return usersdomain.User{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return usersdomain.User{}, err
	}
	return user, nil
}

func (p *Postgres) CreateSession(ctx context.Context, session domain.Session, token domain.RefreshToken) error {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO sessions
			(id, user_id, user_agent, ip_address, created_at, last_seen_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, session.ID, session.UserID, session.UserAgent, session.IPAddress, session.CreatedAt, session.LastSeenAt, session.ExpiresAt)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO refresh_tokens
			(id, session_id, token_hash, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`, token.ID, token.SessionID, token.TokenHash[:], token.CreatedAt, token.ExpiresAt)
	if err != nil {
		return err
	}
	if err := insertSessionStarted(ctx, tx, session); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) Rotate(ctx context.Context, oldHash [32]byte, now time.Time, replacement domain.RefreshToken) (domain.Session, error) {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return domain.Session{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var session domain.Session
	var sessionRevoked sql.NullTime
	var tokenExpires time.Time
	var tokenUsed sql.NullTime
	var tokenRevoked sql.NullTime

	err = tx.QueryRow(ctx, `
		SELECT
			s.id, s.user_id, s.expires_at, s.revoked_at,
			rt.expires_at, rt.used_at, rt.revoked_at
		FROM refresh_tokens rt
		JOIN sessions s ON s.id = rt.session_id
		WHERE rt.token_hash = $1
		FOR UPDATE OF rt, s
	`, oldHash[:]).Scan(
		&session.ID,
		&session.UserID,
		&session.ExpiresAt,
		&sessionRevoked,
		&tokenExpires,
		&tokenUsed,
		&tokenRevoked,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Session{}, ErrRefreshInvalid
	}
	if err != nil {
		return domain.Session{}, err
	}

	if sessionRevoked.Valid || !session.ExpiresAt.After(now) || !tokenExpires.After(now) {
		return domain.Session{}, ErrRefreshInvalid
	}

	if tokenUsed.Valid || tokenRevoked.Valid {
		if _, err := tx.Exec(ctx, `UPDATE sessions SET revoked_at = COALESCE(revoked_at, $2) WHERE id = $1`, session.ID, now); err != nil {
			return domain.Session{}, err
		}
		if _, err := tx.Exec(ctx, `UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, $2) WHERE session_id = $1`, session.ID, now); err != nil {
			return domain.Session{}, err
		}
		if err := tx.Commit(ctx); err != nil {
			return domain.Session{}, err
		}
		return domain.Session{}, ErrRefreshReuse
	}

	replacement.SessionID = session.ID
	if replacement.ExpiresAt.After(session.ExpiresAt) {
		replacement.ExpiresAt = session.ExpiresAt
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO refresh_tokens
			(id, session_id, token_hash, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`, replacement.ID, replacement.SessionID, replacement.TokenHash[:], replacement.CreatedAt, replacement.ExpiresAt); err != nil {
		return domain.Session{}, err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE refresh_tokens
		SET used_at = $2, replaced_by = $3
		WHERE token_hash = $1
	`, oldHash[:], now, replacement.ID); err != nil {
		return domain.Session{}, err
	}

	if _, err := tx.Exec(ctx, `UPDATE sessions SET last_seen_at = $2 WHERE id = $1`, session.ID, now); err != nil {
		return domain.Session{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Session{}, err
	}
	session.LastSeenAt = now
	return session, nil
}

func (p *Postgres) RevokeByTokenHash(ctx context.Context, hash [32]byte, now time.Time) error {
	tx, err := p.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var sessionID string
	err = tx.QueryRow(ctx, `SELECT session_id FROM refresh_tokens WHERE token_hash = $1`, hash[:]).Scan(&sessionID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `UPDATE sessions SET revoked_at = COALESCE(revoked_at, $2) WHERE id = $1`, sessionID, now); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, $2) WHERE session_id = $1`, sessionID, now); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) IsSessionActive(ctx context.Context, sessionID, userID string, now time.Time) (bool, error) {
	var active bool
	err := p.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM sessions s
			JOIN users u ON u.id = s.user_id
			WHERE s.id = $1
			  AND s.user_id = $2
			  AND s.revoked_at IS NULL
			  AND s.expires_at > $3
			  AND u.status = 'active'
		)
	`, sessionID, userID, now).Scan(&active)
	return active, err
}

func mapRegistrationWriteError(err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
		return err
	}
	switch pgErr.ConstraintName {
	case "users_email_key":
		return usersrepo.ErrEmailTaken
	case "profiles_handle_key":
		return usersrepo.ErrHandleTaken
	default:
		return err
	}
}

func insertSessionStarted(ctx context.Context, tx pgx.Tx, session domain.Session) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO activity_events (user_id, event_type, entity_id, occurred_at)
		VALUES ($1, 'session_started', $2, $3)
	`, session.UserID, session.ID, session.CreatedAt)
	return err
}
