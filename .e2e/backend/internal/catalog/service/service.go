package service

import (
	"errors"
	"strings"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
)

var (
	ErrChapterNotFound = errors.New("chapter not found")
	ErrTopicNotFound   = errors.New("topic not found")
)

type Source interface {
	Catalog() domain.Catalog
}

type Service struct {
	catalog domain.Catalog
}

type Summary struct {
	SchemaVersion     int
	SourceRepository  string
	SourceCommit      string
	ChapterCount      int
	TopicCount        int
	ExerciseCount     int
	ContentBlockCount int
}

type TopicSummary struct {
	ID        string
	Number    string
	Title     string
	ChapterID string
	Summary   string
	IsStub    bool
}

type ChapterDetail struct {
	domain.Chapter
	Topics []TopicSummary
}

type TopicDetail struct {
	domain.Topic
	UnresolvedPrerequisiteIDs []string
}

type Prerequisites struct {
	Resolved      []TopicSummary
	UnresolvedIDs []string
}

func New(source Source) *Service {
	return &Service{catalog: source.Catalog()}
}

func (s *Service) Summary() Summary {
	return Summary{
		SchemaVersion:     s.catalog.SchemaVersion,
		SourceRepository:  s.catalog.Source.Repository,
		SourceCommit:      s.catalog.Source.Commit,
		ChapterCount:      len(s.catalog.Chapters),
		TopicCount:        len(s.catalog.Topics),
		ExerciseCount:     s.catalog.ExerciseCount(),
		ContentBlockCount: s.catalog.ContentBlockCount(),
	}
}

func (s *Service) Chapters() []domain.Chapter {
	out := make([]domain.Chapter, len(s.catalog.Chapters))
	copy(out, s.catalog.Chapters)
	return out
}

func (s *Service) Chapter(id string) (ChapterDetail, error) {
	id = strings.TrimSpace(id)
	chapter, ok := s.catalog.Chapter(id)
	if !ok {
		return ChapterDetail{}, ErrChapterNotFound
	}

	topics := make([]TopicSummary, 0, len(chapter.TopicIDs))
	for _, topicID := range chapter.TopicIDs {
		topic, ok := s.catalog.Topic(topicID)
		if !ok {
			continue
		}
		topics = append(topics, summarizeTopic(topic))
	}

	return ChapterDetail{Chapter: chapter, Topics: topics}, nil
}

func (s *Service) Topic(id string) (TopicDetail, error) {
	id = strings.TrimSpace(id)
	topic, ok := s.catalog.Topic(id)
	if !ok {
		return TopicDetail{}, ErrTopicNotFound
	}
	return TopicDetail{
		Topic:                     topic,
		UnresolvedPrerequisiteIDs: s.catalog.UnresolvedPrerequisiteIDs(topic.ID),
	}, nil
}

func (s *Service) Prerequisites(topicID string) (Prerequisites, error) {
	topicID = strings.TrimSpace(topicID)
	topic, ok := s.catalog.Topic(topicID)
	if !ok {
		return Prerequisites{}, ErrTopicNotFound
	}

	resolved := make([]TopicSummary, 0, len(topic.PrerequisiteIDs))
	unresolved := make([]string, 0)
	for _, prerequisiteID := range topic.PrerequisiteIDs {
		prerequisite, ok := s.catalog.Topic(prerequisiteID)
		if !ok {
			unresolved = append(unresolved, prerequisiteID)
			continue
		}
		resolved = append(resolved, summarizeTopic(prerequisite))
	}

	return Prerequisites{Resolved: resolved, UnresolvedIDs: unresolved}, nil
}

func summarizeTopic(topic domain.Topic) TopicSummary {
	return TopicSummary{
		ID:        topic.ID,
		Number:    topic.Number,
		Title:     topic.Title,
		ChapterID: topic.ChapterID,
		Summary:   topic.Summary,
		IsStub:    topic.IsStub,
	}
}
