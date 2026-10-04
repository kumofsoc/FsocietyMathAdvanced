package service

import (
	"context"
	"errors"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/repository"
)

var ErrInvalidInput = errors.New("invalid preferences input")

type Service struct {
	repo repository.Repository
	now  func() time.Time
}

func New(repo repository.Repository, now func() time.Time) *Service {
	if now == nil {
		now = time.Now
	}
	return &Service{repo: repo, now: now}
}

func (s *Service) Get(ctx context.Context, userID string) (domain.Preferences, error) {
	if userID == "" {
		return domain.Preferences{}, ErrInvalidInput
	}
	return s.repo.Get(ctx, userID)
}

func (s *Service) Replace(ctx context.Context, userID string, input domain.Input) (domain.Preferences, error) {
	if userID == "" {
		return domain.Preferences{}, ErrInvalidInput
	}
	normalized, err := domain.Normalize(input)
	if err != nil {
		return domain.Preferences{}, ErrInvalidInput
	}
	return s.repo.Replace(ctx, userID, normalized, s.now().UTC())
}
