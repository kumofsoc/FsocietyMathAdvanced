package service

import (
	"context"
	"errors"
	"time"

	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/repository"
)

var (
	ErrUnknownTopic        = errors.New("unknown topic")
	ErrUnknownReadingBlock = errors.New("unknown reading block")
	ErrCatalogUnavailable  = errors.New("catalog unavailable")
)

type TopicCatalog interface {
	Topic(string) (catalogdomain.Topic, bool)
}

type Service struct {
	repo    repository.Repository
	now     func() time.Time
	catalog TopicCatalog
}

func New(repo repository.Repository, now func() time.Time, catalogs ...TopicCatalog) *Service {
	if now == nil {
		now = time.Now
	}
	var catalog TopicCatalog
	if len(catalogs) > 0 {
		catalog = catalogs[0]
	}
	return &Service{repo: repo, now: now, catalog: catalog}
}

func (s *Service) Snapshot(ctx context.Context, userID string) (domain.Snapshot, error) {
	snapshot, err := s.repo.Snapshot(ctx, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) Topic(ctx context.Context, userID, topicID string) (domain.TopicState, domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.TopicState{}, domain.Snapshot{}, err
	}
	state, err := s.repo.Topic(ctx, userID, normalizedTopicID)
	if err != nil {
		return domain.TopicState{}, domain.Snapshot{}, err
	}
	snapshot, err := s.repo.Snapshot(ctx, userID)
	if err != nil {
		return domain.TopicState{}, domain.Snapshot{}, err
	}
	return state, snapshot.Normalize(), nil
}

func (s *Service) Sync(ctx context.Context, userID string, input domain.SyncInput) (domain.Snapshot, error) {
	normalized, err := domain.NormalizeSync(input)
	if err != nil {
		return domain.Snapshot{}, err
	}
	snapshot, err := s.repo.Sync(ctx, userID, normalized, s.now().UTC())
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) PatchTopic(
	ctx context.Context,
	userID string,
	topicID string,
	patch domain.TopicPatch,
) (domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if err := patch.Validate(); err != nil {
		return domain.Snapshot{}, err
	}

	snapshot, err := s.repo.PatchTopic(ctx, userID, normalizedTopicID, patch, s.now().UTC())
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) SetTheoryCompletion(
	ctx context.Context,
	userID string,
	topicID string,
	completed bool,
) (domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}
	snapshot, err := s.repo.SetTheoryCompletion(ctx, userID, normalizedTopicID, completed, s.now().UTC())
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) SetExercise(
	ctx context.Context,
	userID string,
	taskID string,
	topicID string,
	solved bool,
) (domain.Snapshot, error) {
	normalizedTaskID, err := domain.NormalizeID(taskID, domain.MaxTaskIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}
	normalizedTopicID, err := normalizeOptionalTopicID(topicID)
	if err != nil {
		return domain.Snapshot{}, err
	}

	snapshot, err := s.repo.SetExercise(
		ctx,
		userID,
		normalizedTaskID,
		normalizedTopicID,
		solved,
		s.now().UTC(),
	)
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) SetTheorem(
	ctx context.Context,
	userID string,
	theoremID string,
	topicID string,
	saved bool,
) (domain.Snapshot, error) {
	normalizedTheoremID, err := domain.NormalizeID(theoremID, domain.MaxTheoremIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}
	normalizedTopicID, err := normalizeOptionalTopicID(topicID)
	if err != nil {
		return domain.Snapshot{}, err
	}

	snapshot, err := s.repo.SetTheorem(
		ctx,
		userID,
		normalizedTheoremID,
		normalizedTopicID,
		saved,
		s.now().UTC(),
	)
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) SetResume(
	ctx context.Context,
	userID string,
	topicID string,
) (domain.Snapshot, error) {
	normalizedTopicID, err := domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
	if err != nil {
		return domain.Snapshot{}, err
	}
	snapshot, err := s.repo.SetResume(ctx, userID, normalizedTopicID, s.now().UTC())
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) MarkReadingBlock(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) (domain.Snapshot, error) {
	return s.MergeReadingBlocks(ctx, userID, []domain.ReadingBlockRef{{
		TopicID:    topicID,
		BlockIndex: blockIndex,
	}})
}

func (s *Service) MergeReadingBlocks(
	ctx context.Context,
	userID string,
	blocks []domain.ReadingBlockRef,
) (domain.Snapshot, error) {
	normalized, err := domain.NormalizeReadingBlockRefs(blocks)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if len(normalized) == 0 {
		return s.Snapshot(ctx, userID)
	}
	if s.catalog == nil {
		return domain.Snapshot{}, ErrCatalogUnavailable
	}

	totalBlocks := make(map[string]int)
	for _, block := range normalized {
		topic, ok := s.catalog.Topic(block.TopicID)
		if !ok {
			return domain.Snapshot{}, ErrUnknownTopic
		}
		if !topicHasBlockIndex(topic, block.BlockIndex) {
			return domain.Snapshot{}, ErrUnknownReadingBlock
		}
		totalBlocks[block.TopicID] = len(topic.ContentBlocks)
	}

	snapshot, err := s.repo.MergeReadingBlocks(
		ctx,
		userID,
		normalized,
		totalBlocks,
		s.now().UTC(),
	)
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func topicHasBlockIndex(topic catalogdomain.Topic, blockIndex int) bool {
	for _, block := range topic.ContentBlocks {
		if block.Index == blockIndex {
			return true
		}
	}
	return false
}

func normalizeOptionalTopicID(topicID string) (string, error) {
	if topicID == "" {
		return "", nil
	}
	return domain.NormalizeID(topicID, domain.MaxTopicIDBytes)
}
