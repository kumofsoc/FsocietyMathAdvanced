package service

import (
	"errors"
	"sort"
	"strings"
	"unicode/utf8"

	searchdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/domain"
	searchindex "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/index"
)

var (
	ErrInvalidQuery = errors.New("invalid search query")
	ErrInvalidLimit = errors.New("invalid search limit")
)

const (
	DefaultLimit  = 20
	MaxLimit      = 50
	MaxQueryRunes = 128
)

type Service struct {
	index searchindex.Index
}

func New(index searchindex.Index) *Service {
	return &Service{index: index}
}

func (s *Service) Search(query string, limit int) ([]searchdomain.Result, error) {
	query = strings.TrimSpace(query)
	if query == "" || utf8.RuneCountInString(query) > MaxQueryRunes {
		return nil, ErrInvalidQuery
	}
	if limit == 0 {
		limit = DefaultLimit
	}
	if limit < 1 || limit > MaxLimit {
		return nil, ErrInvalidLimit
	}

	results := make([]searchdomain.Result, 0, limit)
	for _, document := range s.index.Documents {
		score := searchindex.Score(document, query)
		if score <= 0 {
			continue
		}
		results = append(results, searchdomain.Result{
			Type:           document.Type,
			ID:             document.ID,
			Title:          document.Title,
			Subtitle:       document.Subtitle,
			Score:          score,
			TopicID:        document.TopicID,
			ContentBlockID: document.ContentBlockID,
			BlockIndex:     document.BlockIndex,
			Kind:           document.Kind,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		if results[i].Score != results[j].Score {
			return results[i].Score > results[j].Score
		}
		if typePriority(results[i].Type) != typePriority(results[j].Type) {
			return typePriority(results[i].Type) < typePriority(results[j].Type)
		}
		if results[i].Title != results[j].Title {
			return results[i].Title < results[j].Title
		}
		return results[i].ID < results[j].ID
	})
	if len(results) > limit {
		results = results[:limit]
	}
	return results, nil
}

func typePriority(value string) int {
	switch value {
	case "topic":
		return 0
	case "theorem":
		return 1
	case "formula":
		return 2
	case "block":
		return 3
	case "chapter":
		return 4
	default:
		return 5
	}
}
