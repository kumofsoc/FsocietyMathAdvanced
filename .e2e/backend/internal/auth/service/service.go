package service

import (
	"context"
	"errors"
	"strings"
	"time"

	authdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/domain"
	authrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/repository"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/security"
	usersdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	usersrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidInput       = errors.New("invalid input")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrDisabled           = errors.New("account disabled")
)

type UserRepository interface {
	ByEmail(context.Context, string) (usersdomain.User, error)
	ByID(context.Context, string) (usersdomain.User, error)
}

type SessionRepository interface {
	RegisterAccount(context.Context, usersrepo.CreateAccountParams, authdomain.Session, authdomain.RefreshToken) (usersdomain.User, error)
	CreateSession(context.Context, authdomain.Session, authdomain.RefreshToken) error
	Rotate(context.Context, [32]byte, time.Time, authdomain.RefreshToken) (authdomain.Session, error)
	RevokeByTokenHash(context.Context, [32]byte, time.Time) error
	IsSessionActive(context.Context, string, string, time.Time) (bool, error)
}

type AccessTokens interface {
	Issue(string, string, time.Time) (string, time.Time, error)
	Parse(string, time.Time) (security.AccessClaims, error)
}

type Service struct {
	users      UserRepository
	sessions   SessionRepository
	access     AccessTokens
	refreshTTL time.Duration
	now        func() time.Time
}

type RegisterInput struct {
	Email       string
	Password    string
	Handle      string
	DisplayName string
	Bio         string
	UserAgent   string
	IPAddress   string
}

type LoginInput struct {
	Email     string
	Password  string
	UserAgent string
	IPAddress string
}

type Result struct {
	AccessToken     string
	AccessExpiresAt time.Time
	User            usersdomain.User
}

func New(users UserRepository, sessions SessionRepository, access AccessTokens, refreshTTL time.Duration, now func() time.Time) *Service {
	if now == nil {
		now = time.Now
	}
	return &Service{users: users, sessions: sessions, access: access, refreshTTL: refreshTTL, now: now}
}

func (s *Service) Register(ctx context.Context, input RegisterInput) (Result, string, error) {
	email := usersdomain.NormalizeEmail(input.Email)
	handle := usersdomain.NormalizeHandle(input.Handle)
	displayName := strings.TrimSpace(input.DisplayName)
	bio := strings.TrimSpace(input.Bio)

	if err := usersdomain.ValidateEmail(email); err != nil {
		return Result{}, "", ErrInvalidInput
	}
	if len([]byte(input.Password)) < 10 || len([]byte(input.Password)) > 256 {
		return Result{}, "", ErrInvalidInput
	}
	if err := usersdomain.ValidateHandle(handle); err != nil {
		return Result{}, "", ErrInvalidInput
	}
	if err := usersdomain.ValidateDisplayName(displayName); err != nil {
		return Result{}, "", ErrInvalidInput
	}
	if err := usersdomain.ValidateBio(bio); err != nil {
		return Result{}, "", ErrInvalidInput
	}

	passwordHash, err := security.HashPassword(input.Password)
	if err != nil {
		return Result{}, "", err
	}
	userID, err := security.NewID()
	if err != nil {
		return Result{}, "", err
	}
	sessionID, err := security.NewID()
	if err != nil {
		return Result{}, "", err
	}
	tokenID, err := security.NewID()
	if err != nil {
		return Result{}, "", err
	}
	rawRefresh, refreshHash, err := security.NewRefreshToken()
	if err != nil {
		return Result{}, "", err
	}

	now := s.now().UTC()
	expiresAt := sessionExpiry(now, s.refreshTTL)

	user, err := s.sessions.RegisterAccount(
		ctx,
		usersrepo.CreateAccountParams{
			ID:           userID,
			Email:        email,
			PasswordHash: passwordHash,
			Handle:       handle,
			DisplayName:  displayName,
			Bio:          bio,
		},
		authdomain.Session{
			ID:         sessionID,
			UserID:     userID,
			UserAgent:  truncate(input.UserAgent, 512),
			IPAddress:  truncate(input.IPAddress, 64),
			CreatedAt:  now,
			LastSeenAt: now,
			ExpiresAt:  expiresAt,
		},
		authdomain.RefreshToken{
			ID:        tokenID,
			SessionID: sessionID,
			TokenHash: refreshHash,
			CreatedAt: now,
			ExpiresAt: expiresAt,
		},
	)
	if err != nil {
		return Result{}, "", err
	}

	accessToken, accessExpiresAt, err := s.access.Issue(user.ID, sessionID, now)
	if err != nil {
		return Result{}, "", err
	}
	return Result{AccessToken: accessToken, AccessExpiresAt: accessExpiresAt, User: user}, rawRefresh, nil
}

func (s *Service) Login(ctx context.Context, input LoginInput) (Result, string, error) {
	email := usersdomain.NormalizeEmail(input.Email)
	user, err := s.users.ByEmail(ctx, email)
	if errors.Is(err, usersrepo.ErrNotFound) {
		security.SimulatePasswordVerification(input.Password)
		return Result{}, "", ErrInvalidCredentials
	}
	if err != nil {
		return Result{}, "", err
	}
	if user.Status != "active" {
		return Result{}, "", ErrDisabled
	}
	ok, err := security.VerifyPassword(user.PasswordHash, input.Password)
	if err != nil || !ok {
		return Result{}, "", ErrInvalidCredentials
	}
	return s.createSession(ctx, user, input.UserAgent, input.IPAddress)
}

func (s *Service) Refresh(ctx context.Context, rawRefresh string) (Result, string, error) {
	if rawRefresh == "" {
		return Result{}, "", ErrUnauthorized
	}

	now := s.now().UTC()
	nextRaw, nextHash, err := security.NewRefreshToken()
	if err != nil {
		return Result{}, "", err
	}
	nextID, err := security.NewID()
	if err != nil {
		return Result{}, "", err
	}

	session, err := s.sessions.Rotate(ctx, security.HashRefreshToken(rawRefresh), now, authdomain.RefreshToken{
		ID:        nextID,
		TokenHash: nextHash,
		CreatedAt: now,
		ExpiresAt: sessionExpiry(now, s.refreshTTL),
	})
	if errors.Is(err, authrepo.ErrRefreshInvalid) || errors.Is(err, authrepo.ErrRefreshReuse) {
		return Result{}, "", ErrUnauthorized
	}
	if err != nil {
		return Result{}, "", err
	}

	user, err := s.users.ByID(ctx, session.UserID)
	if err != nil || user.Status != "active" {
		return Result{}, "", ErrUnauthorized
	}
	accessToken, accessExpiresAt, err := s.access.Issue(user.ID, session.ID, now)
	if err != nil {
		return Result{}, "", err
	}
	return Result{AccessToken: accessToken, AccessExpiresAt: accessExpiresAt, User: user}, nextRaw, nil
}

func (s *Service) Logout(ctx context.Context, rawRefresh string) error {
	if rawRefresh == "" {
		return nil
	}
	return s.sessions.RevokeByTokenHash(ctx, security.HashRefreshToken(rawRefresh), s.now().UTC())
}

func (s *Service) Authenticate(ctx context.Context, rawAccess string) (security.AccessClaims, error) {
	claims, err := s.access.Parse(rawAccess, s.now().UTC())
	if err != nil {
		return security.AccessClaims{}, ErrUnauthorized
	}
	active, err := s.sessions.IsSessionActive(ctx, claims.SessionID, claims.Subject, s.now().UTC())
	if err != nil {
		return security.AccessClaims{}, err
	}
	if !active {
		return security.AccessClaims{}, ErrUnauthorized
	}
	return claims, nil
}

func (s *Service) createSession(ctx context.Context, user usersdomain.User, userAgent, ip string) (Result, string, error) {
	now := s.now().UTC()
	sessionID, err := security.NewID()
	if err != nil {
		return Result{}, "", err
	}
	tokenID, err := security.NewID()
	if err != nil {
		return Result{}, "", err
	}
	rawRefresh, refreshHash, err := security.NewRefreshToken()
	if err != nil {
		return Result{}, "", err
	}
	expiresAt := sessionExpiry(now, s.refreshTTL)

	err = s.sessions.CreateSession(ctx, authdomain.Session{
		ID:         sessionID,
		UserID:     user.ID,
		UserAgent:  truncate(userAgent, 512),
		IPAddress:  truncate(ip, 64),
		CreatedAt:  now,
		LastSeenAt: now,
		ExpiresAt:  expiresAt,
	}, authdomain.RefreshToken{
		ID:        tokenID,
		SessionID: sessionID,
		TokenHash: refreshHash,
		CreatedAt: now,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		return Result{}, "", err
	}

	accessToken, accessExpiresAt, err := s.access.Issue(user.ID, sessionID, now)
	if err != nil {
		return Result{}, "", err
	}
	return Result{AccessToken: accessToken, AccessExpiresAt: accessExpiresAt, User: user}, rawRefresh, nil
}

func sessionExpiry(now time.Time, ttl time.Duration) time.Time {
	return now.Add(ttl)
}

func truncate(value string, max int) string {
	runes := []rune(value)
	if len(runes) <= max {
		return value
	}
	return string(runes[:max])
}
