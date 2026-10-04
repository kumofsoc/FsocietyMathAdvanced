package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/domain"
)

type Repository interface {
	Get(context.Context, string) (domain.Preferences, error)
	Replace(context.Context, string, domain.Input, time.Time) (domain.Preferences, error)
}
