package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/domain"
)

type Repository interface {
	List(context.Context, string, time.Time, time.Time, int) ([]domain.Event, error)
	DailyCounts(context.Context, string, time.Time, time.Time) ([]domain.DayCount, error)
}
