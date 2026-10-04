package repository

import (
	"context"
	"errors"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/domain"
)

var (
	ErrNotFound      = errors.New("media track not found")
	ErrTrackLimit    = errors.New("media track limit reached")
	ErrOrderConflict = errors.New("playlist order conflicts with current tracks")
)

type Repository interface {
	Create(context.Context, domain.Track) (domain.Track, error)
	List(context.Context, string) ([]domain.Track, error)
	Get(context.Context, string, string) (domain.Track, error)
	Rename(context.Context, string, string, string) (domain.Track, error)
	Delete(context.Context, string, string) (domain.Track, error)
	Reorder(context.Context, string, []string) ([]domain.Track, error)
}
