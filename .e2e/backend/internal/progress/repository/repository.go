package repository

import (
	"context"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
)

type Repository interface {
	Snapshot(context.Context, string) (domain.Snapshot, error)
	Topic(context.Context, string, string) (domain.TopicState, error)
	Sync(context.Context, string, domain.SyncInput, time.Time) (domain.Snapshot, error)
	PatchTopic(context.Context, string, string, domain.TopicPatch, time.Time) (domain.Snapshot, error)
	SetTheoryCompletion(context.Context, string, string, bool, time.Time) (domain.Snapshot, error)
	SetExercise(context.Context, string, string, string, bool, time.Time) (domain.Snapshot, error)
	SetTheorem(context.Context, string, string, string, bool, time.Time) (domain.Snapshot, error)
	SetResume(context.Context, string, string, time.Time) (domain.Snapshot, error)
	MergeReadingBlocks(context.Context, string, []domain.ReadingBlockRef, map[string]int, time.Time) (domain.Snapshot, error)
}
