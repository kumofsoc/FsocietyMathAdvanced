package service

import (
	"context"
	"errors"
	"strconv"
	"time"

	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/repository"
)

var (
	ErrInvalidInput = errors.New("invalid important block input")
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

func (s *Service) List(ctx context.Context, userID string) ([]domain.ImportantBlock, error) {
	if userID == "" {
		return nil, ErrInvalidInput
	}
	return s.repo.List(ctx, userID)
}

func (s *Service) Put(
	ctx context.Context,
	userID string,
	topicID string,
	blockIndex int,
) (domain.ImportantBlock, error) {
	normalizedTopicID, err := normalizeAddress(userID, topicID, blockIndex)
	if err != nil {
		return domain.ImportantBlock{}, err
	}
	if err := s.validateCatalogAddress(normalizedTopicID, blockIndex); err != nil {
		return domain.ImportantBlock{}, err
	}
	return s.repo.Upsert(ctx, userID, normalizedTopicID, blockIndex, s.now().UTC())
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

func normalizeAddress(userID, topicID string, blockIndex int) (string, error) {
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
	expectedID := topicID + "::" + strconv.Itoa(blockIndex)
	for _, block := range topic.ContentBlocks {
		if block.Index == blockIndex && block.ID == expectedID {
			return nil
		}
	}
	return ErrUnknownBlock
}
