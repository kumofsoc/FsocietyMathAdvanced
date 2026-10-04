package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/domain"
)

type Repository interface {
	List(context.Context, string) ([]domain.Bookmark, error)
	CreateOrUpgrade(context.Context, string, domain.CreateInput, time.Time) (domain.Bookmark, bool, error)
	DeleteOwned(context.Context, string, string, time.Time) (bool, error)
}
