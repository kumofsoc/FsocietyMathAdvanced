package service

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/repository"
)

const (
	DefaultListDays = 28
	MaxRangeDays    = 366
	MaxEvents       = 1000
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

func (s *Service) List(
	ctx context.Context,
	userID string,
	from *time.Time,
	to *time.Time,
) ([]domain.Event, error) {
	now := s.now().UTC()
	resolvedTo := now
	if to != nil {
		resolvedTo = to.UTC()
	}
	resolvedFrom := dayStartUTC(resolvedTo).AddDate(0, 0, -(DefaultListDays - 1))
	if from != nil {
		resolvedFrom = from.UTC()
	}

	if !resolvedTo.After(resolvedFrom) || resolvedTo.Sub(resolvedFrom) > (MaxRangeDays+1)*24*time.Hour {
		return nil, domain.ErrInvalidRange
	}
	return s.repo.List(ctx, userID, resolvedFrom, resolvedTo, MaxEvents)
}

func (s *Service) Heatmap(ctx context.Context, userID string, year int) ([]domain.HeatmapDay, error) {
	if year < 1970 || year > 2100 {
		return nil, domain.ErrInvalidYear
	}
	start := time.Date(year, time.January, 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(1, 0, 0)
	counts, err := s.repo.DailyCounts(ctx, userID, start, end)
	if err != nil {
		return nil, err
	}
	return domain.BuildHeatmap(year, counts)
}

func (s *Service) Stats(ctx context.Context, userID string, days int) (domain.Stats, error) {
	if days == 0 {
		days = DefaultListDays
	}
	if days < 1 || days > MaxRangeDays {
		return domain.Stats{}, domain.ErrInvalidDays
	}

	today := dayStartUTC(s.now())
	start := today.AddDate(0, 0, -(days - 1))
	end := today.AddDate(0, 0, 1)

	counts, err := s.repo.DailyCounts(ctx, userID, start, end)
	if err != nil {
		return domain.Stats{}, err
	}
	return domain.CalculateStats(start, days, counts)
}

func dayStartUTC(value time.Time) time.Time {
	value = value.UTC()
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, time.UTC)
}
