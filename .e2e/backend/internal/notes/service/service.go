package service

import (
	"context"
	"errors"
	"time"

	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/repository"
)

const (
	MaxListLimit  = 101
	MaxListOffset = 10000
)

var (
	ErrInvalidInput = errors.New("invalid note input")
	ErrUnknownTopic = errors.New("unknown topic")
	ErrUnknownBlock = errors.New("unknown content block")
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

func (s *Service) List(
	ctx context.Context,
	userID string,
	limit int,
	offset int,
) ([]domain.Note, error) {
	if userID == "" || limit < 1 || limit > MaxListLimit || offset < 0 || offset > MaxListOffset {
		return nil, ErrInvalidInput
	}
	return s.repo.List(ctx, userID, limit, offset)
}

func (s *Service) Get(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) (domain.Note, error) {
	normalizedTopicID, err := normalizeAddress(userID, topicID, blockIndex)
	if err != nil {
		return domain.Note{}, err
	}
	return s.repo.Get(ctx, userID, normalizedTopicID, blockIndex)
}

func (s *Service) Put(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
	text string,
) (*domain.Note, error) {
	normalizedTopicID, err := normalizeAddress(userID, topicID, blockIndex)
	if err != nil {
		return nil, err
	}
	normalizedText, err := domain.NormalizeText(text)
	if err != nil {
		return nil, ErrInvalidInput
	}
	if normalizedText == "" {
		if _, err := s.repo.Delete(ctx, userID, normalizedTopicID, blockIndex); err != nil {
			return nil, err
		}
		return nil, nil
	}
	if err := s.validateCatalogAddress(normalizedTopicID, blockIndex); err != nil {
		return nil, err
	}

	item, err := s.repo.Upsert(
		ctx,
		userID,
		normalizedTopicID,
		blockIndex,
		normalizedText,
		s.now().UTC(),
	)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *Service) Delete(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) error {
	normalizedTopicID, err := normalizeAddress(userID, topicID, blockIndex)
	if err != nil {
		return err
	}
	_, err = s.repo.Delete(ctx, userID, normalizedTopicID, blockIndex)
	return err
}

func normalizeAddress(
	userID string,
	topicID string,
	blockIndex int,
) (string, error) {
	if userID == "" || domain.ValidateBlockIndex(blockIndex) != nil {
		return "", ErrInvalidInput
	}
	normalizedTopicID, err := domain.NormalizeTopicID(topicID)
	if err != nil {
		return "", ErrInvalidInput
	}
	return normalizedTopicID, nil
}

func (s *Service) validateCatalogAddress(topicID string, blockIndex int) error {
	if s.catalog == nil {
		return nil
	}
	topic, ok := s.catalog.Topic(topicID)
	if !ok {
		return ErrUnknownTopic
	}
	for _, block := range topic.ContentBlocks {
		if block.Index == blockIndex {
			return nil
		}
	}
	return ErrUnknownBlock
}
