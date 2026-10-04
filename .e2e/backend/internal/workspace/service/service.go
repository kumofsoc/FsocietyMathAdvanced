package service

import (
	"context"
	"errors"
	"time"

	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/repository"
)

var (
	ErrInvalidInput = errors.New("invalid workspace input")
	ErrUnknownTopic = errors.New("unknown topic")
)

type TopicCatalog interface {
	Topic(string) (catalogdomain.Topic, bool)
}

type Service struct {
	repo    repository.Repository
	catalog TopicCatalog
	now     func() time.Time
}

func New(repo repository.Repository, catalog TopicCatalog, now func() time.Time) *Service {
	if now == nil {
		now = time.Now
	}
	return &Service{repo: repo, catalog: catalog, now: now}
}

func (s *Service) Snapshot(ctx context.Context, userID string) (domain.Snapshot, error) {
	if userID == "" {
		return domain.Snapshot{}, ErrInvalidInput
	}
	snapshot, err := s.repo.Snapshot(ctx, userID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	return snapshot.Normalize(), nil
}

func (s *Service) SetTopicSaved(
	ctx context.Context,
	userID string,
	topicID string,
	saved bool,
) (domain.Snapshot, error) {
	if userID == "" {
		return domain.Snapshot{}, ErrInvalidInput
	}
	normalizedTopicID, err := s.knownTopic(topicID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if _, err := s.repo.SetTopicSaved(ctx, userID, normalizedTopicID, saved, s.now().UTC()); err != nil {
		return domain.Snapshot{}, err
	}
	return s.Snapshot(ctx, userID)
}

func (s *Service) SetResume(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) (domain.Snapshot, error) {
	if userID == "" || domain.ValidateBlockIndex(blockIndex) != nil {
		return domain.Snapshot{}, ErrInvalidInput
	}
	normalizedTopicID, topic, err := s.knownTopicWithValue(topicID)
	if err != nil {
		return domain.Snapshot{}, err
	}
	if !containsBlockIndex(topic, blockIndex) {
		return domain.Snapshot{}, ErrInvalidInput
	}
	if _, err := s.repo.SetResume(ctx, userID, normalizedTopicID, blockIndex, s.now().UTC()); err != nil {
		return domain.Snapshot{}, err
	}
	return s.Snapshot(ctx, userID)
}

func (s *Service) SetReadingWidth(
	ctx context.Context,
	userID string,
	readingWidth string,
) (domain.Snapshot, error) {
	if userID == "" {
		return domain.Snapshot{}, ErrInvalidInput
	}
	normalized, err := domain.NormalizeReadingWidth(readingWidth)
	if err != nil {
		return domain.Snapshot{}, ErrInvalidInput
	}
	if _, err := s.repo.SetReadingWidth(ctx, userID, normalized, s.now().UTC()); err != nil {
		return domain.Snapshot{}, err
	}
	return s.Snapshot(ctx, userID)
}

func (s *Service) knownTopic(topicID string) (string, error) {
	normalized, _, err := s.knownTopicWithValue(topicID)
	return normalized, err
}

func (s *Service) knownTopicWithValue(topicID string) (string, catalogdomain.Topic, error) {
	normalized, err := domain.NormalizeTopicID(topicID)
	if err != nil {
		return "", catalogdomain.Topic{}, err
	}
	if s.catalog == nil {
		return normalized, catalogdomain.Topic{}, nil
	}
	topic, ok := s.catalog.Topic(normalized)
	if !ok {
		return "", catalogdomain.Topic{}, ErrUnknownTopic
	}
	return normalized, topic, nil
}

func containsBlockIndex(topic catalogdomain.Topic, blockIndex int) bool {
	for _, block := range topic.ContentBlocks {
		if block.Index == blockIndex {
			return true
		}
	}
	return false
}
