package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/domain"
)

type Repository interface {
	List(context.Context, string, int, int) ([]domain.Note, error)
	Get(context.Context, string, string, int) (domain.Note, error)
	Upsert(context.Context, string, string, int, string, time.Time) (domain.Note, error)
	Delete(context.Context, string, string, int) (bool, error)
}
