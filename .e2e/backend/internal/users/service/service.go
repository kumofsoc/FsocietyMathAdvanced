package service

import (
	"context"
	"strings"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
)

type Service struct {
	users repository.Repository
}

type UpdateProfileInput struct {
	Handle      string
	DisplayName string
	Bio         string
}

func New(users repository.Repository) *Service {
	return &Service{users: users}
}

func (s *Service) Me(ctx context.Context, userID string) (domain.User, error) {
	return s.users.ByID(ctx, userID)
}

func (s *Service) UpdateProfile(ctx context.Context, userID string, input UpdateProfileInput) (domain.User, error) {
	handle := domain.NormalizeHandle(input.Handle)
	displayName := strings.TrimSpace(input.DisplayName)
	bio := strings.TrimSpace(input.Bio)

	if err := domain.ValidateHandle(handle); err != nil {
		return domain.User{}, err
	}
	if err := domain.ValidateDisplayName(displayName); err != nil {
		return domain.User{}, err
	}
	if err := domain.ValidateBio(bio); err != nil {
		return domain.User{}, err
	}

	return s.users.UpdateProfile(ctx, userID, repository.UpdateProfileParams{
		Handle:      handle,
		DisplayName: displayName,
		Bio:         bio,
	})
}
