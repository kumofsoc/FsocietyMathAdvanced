package repository

import (
	"context"
	"errors"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
)

var (
	ErrNotFound    = errors.New("user not found")
	ErrEmailTaken  = errors.New("email already exists")
	ErrHandleTaken = errors.New("handle already exists")
)

type CreateAccountParams struct {
	ID           string
	Email        string
	PasswordHash string
	Handle       string
	DisplayName  string
	Bio          string
}

type UpdateProfileParams struct {
	Handle      string
	DisplayName string
	Bio         string
}

type Repository interface {
	CreateAccount(context.Context, CreateAccountParams) (domain.User, error)
	ByEmail(context.Context, string) (domain.User, error)
	ByID(context.Context, string) (domain.User, error)
	UpdateProfile(context.Context, string, UpdateProfileParams) (domain.User, error)
}
