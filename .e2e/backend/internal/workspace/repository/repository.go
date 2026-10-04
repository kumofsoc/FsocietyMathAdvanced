package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/domain"
)

type Repository interface {
	Snapshot(context.Context, string) (domain.Snapshot, error)
	SetTopicSaved(context.Context, string, string, bool, time.Time) (bool, error)
	SetResume(context.Context, string, string, int, time.Time) (bool, error)
	SetReadingWidth(context.Context, string, string, time.Time) (bool, error)
}
