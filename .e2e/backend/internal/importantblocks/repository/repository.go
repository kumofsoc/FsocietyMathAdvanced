package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/domain"
)

type Repository interface {
	List(context.Context, string) ([]domain.ImportantBlock, error)
	Upsert(context.Context, string, string, int, time.Time) (domain.ImportantBlock, error)
	Delete(context.Context, string, string, int) (bool, error)
}
