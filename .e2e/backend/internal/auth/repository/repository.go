package repository

import (
	"context"
	"errors"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/domain"
	usersdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	usersrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
)

var (
	ErrRefreshInvalid = errors.New("refresh token invalid")
	ErrRefreshReuse   = errors.New("refresh token reuse detected")
)

type Repository interface {
	RegisterAccount(context.Context, usersrepo.CreateAccountParams, domain.Session, domain.RefreshToken) (usersdomain.User, error)
	CreateSession(context.Context, domain.Session, domain.RefreshToken) error
	Rotate(context.Context, [32]byte, time.Time, domain.RefreshToken) (domain.Session, error)
	RevokeByTokenHash(context.Context, [32]byte, time.Time) error
	IsSessionActive(context.Context, string, string, time.Time) (bool, error)
}
