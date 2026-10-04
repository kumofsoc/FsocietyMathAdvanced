package service

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/repository"
)

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

func (s *Service) List(ctx context.Context, userID string) ([]domain.Bookmark, error) {
	return s.repo.List(ctx, userID)
}

func (s *Service) Create(ctx context.Context, userID string, input domain.CreateInput) (domain.Bookmark, bool, error) {
	normalized, err := domain.NormalizeCreate(input)
	if err != nil {
		return domain.Bookmark{}, false, err
	}
	return s.repo.CreateOrUpgrade(ctx, userID, normalized, s.now().UTC())
}

func (s *Service) Delete(ctx context.Context, userID, bookmarkID string) error {
	normalizedID, err := domain.NormalizeBookmarkID(bookmarkID)
	if err != nil {
		return err
	}
	_, err = s.repo.DeleteOwned(ctx, userID, normalizedID, s.now().UTC())
	return err
}
